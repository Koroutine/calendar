<script>
  import { getContext, onMount } from "svelte";
  import { is_function } from "./utils.js";
  import {
    createEventContent,
    createEventClasses,
    toEventWithLocalDates,
    toViewWithLocalDates,
    setContent,
    bgEvent,
    helperEvent,
    ghostEvent,
    keyEnter,
    resourceBackgroundColor,
    resourceTextColor,
    task,
  } from "@event-calendar/core";
  import { writable } from "svelte/store";

  let { date: date, chunk: chunk } = $props();

  let {
    displayEventEnd,
    eventAllUpdated,
    eventBackgroundColor,
    eventTextColor,
    eventColor,
    eventContent,
    eventClick,
    eventDidMount,
    eventClassNames,
    eventMouseEnter,
    eventMouseLeave,
    slotEventOverlap,
    slotDuration,
    slotHeight,
    resources,
    theme,
    _view,
    _intlEventTime,
    _interaction,
    _iClasses,
    _slotTimeLimits,
    _tasks,
  } = getContext("state");

  let el;
  let display = writable(chunk.event.display);
  let classes = writable("");
  let style = writable("");
  let content = $state();
  let timeText = $state();

  const event = $derived(chunk.event);

  $effect(() => {

    display.set(event.display);

    // Style
    let step = $slotDuration.seconds;
    let offset = $_slotTimeLimits.min.seconds;
    let start = (chunk.start - date) / 1000;
    let end = (chunk.end - date) / 1000;
    let top = ((start - offset) / step) * $slotHeight;
    let height = ((end - start) / step) * $slotHeight;
    let maxHeight =
      (($_slotTimeLimits.max.seconds - start) / step) * $slotHeight;
    let bgColor =
      event.backgroundColor ||
      resourceBackgroundColor(event, $resources) ||
      $eventBackgroundColor ||
      $eventColor;
    let txtColor =
      event.textColor ||
      resourceTextColor(event, $resources) ||
      $eventTextColor;

    style.set(
      `top:${top}px;` +
        `min-height:${height}px;` +
        `height:${height}px;` +
        `max-height:${maxHeight}px;` +
        (bgColor ? `background-color:${bgColor};` : "") +
        (txtColor ? `color:${txtColor};` : "") +
        ((!bgEvent($display) && !helperEvent($display)) || ghostEvent($display)
          ? `z-index:${chunk.column + 1};` +
            `left:${(100 / chunk.group.columns.length) * chunk.column}%;` +
            `width:${(100 / chunk.group.columns.length) * ($slotEventOverlap ? 0.5 * (1 + chunk.group.columns.length - chunk.column) : 1)}%;`
          : "") +
        event.styles.join(";")
    );

    // Class
    classes.set(
      [
        bgEvent($display) ? $theme.bgEvent : $theme.event,
        ...$_iClasses([], event),
        ...createEventClasses($eventClassNames, event, $_view),
      ].join(" ")
    );

  });

  $effect(() => {
    [timeText, content] = createEventContent(
      chunk,
      $displayEventEnd,
      $eventContent,
      $theme,
      $_intlEventTime,
      $_view
    );
  });

  onMount(() => {
    if (is_function($eventDidMount)) {
      $eventDidMount({
        event: toEventWithLocalDates(event),
        timeText,
        el,
        view: toViewWithLocalDates($_view),
      });
    }
  });

  $effect(() => {
    if (is_function($eventAllUpdated) && !helperEvent($display)) {
      task(
        () => $eventAllUpdated({ view: toViewWithLocalDates($_view) }),
        "eau",
        _tasks
      );
    }
  });

  function createHandler(fn, $display) {
    return !helperEvent($display) && is_function(fn)
      ? (jsEvent) =>
          fn({
            event: toEventWithLocalDates(event),
            el,
            jsEvent,
            view: toViewWithLocalDates($_view),
          })
      : undefined;
  }

  function createDragHandler(interaction, resize) {
    return interaction.action
      ? (jsEvent) => interaction.action.drag(event, jsEvent, resize)
      : undefined;
  }

  const onclick = $derived(
    !bgEvent($display) && createHandler($eventClick, $display)
  );
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<article
  bind:this={el}
  class={$classes}
  style={$style}
  role={onclick ? "button" : undefined}
  tabindex={onclick ? 0 : undefined}
  {onclick}
  onkeydown={onclick && keyEnter(onclick)}
  onmouseenter={(e) => {
    createHandler($eventMouseEnter, $display);
  }}
  onmouseleave={createHandler($eventMouseLeave, $display)}
  onpointerdown={!bgEvent($display) &&
    !helperEvent($display) &&
    createDragHandler($_interaction)}
>
  <div class={$theme.eventBody} use:setContent={content}></div>
  <svelte:component
    this={$_interaction.resizer}
    {event}
    onpointerdown={createDragHandler($_interaction, "y")}
  />
</article>

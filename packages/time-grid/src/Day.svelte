<script>
  import { getContext } from "svelte";
  import {
    cloneDate,
    addDuration,
    datesEqual,
    createEventChunk,
    eventIntersects,
    floor,
    rect,
    setPayload,
    bgEvent,
  } from "@event-calendar/core";
  import { groupEventChunks } from "./utils";
  import Event from "./Event.svelte";
  import NowIndicator from "./NowIndicator.svelte";
  import { writable } from 'svelte/store';

  let { date: date, resource: resource = undefined } = $props();

  let {
    _events,
    _iEvents,
    highlightedDates,
    nowIndicator,
    slotDuration,
    slotHeight,
    theme,
    _interaction,
    _today,
    _slotTimeLimits,
  } = getContext("state");

  let el = $state();
  //let chunks = $state([]),
    //bgChunks = $state([]);

  let start = '',
    end = '';

  $effect(() => {
    start = addDuration(cloneDate(date), $_slotTimeLimits.min);
    end = addDuration(cloneDate(date), $_slotTimeLimits.max);
  });

const chunks = writable([]);
const bgChunks = writable([]);

$effect(() => {
    const newChunks = [];
    const newBgChunks = [];

    for (let event of $_events) {
      if ((!event.allDay || bgEvent(event.display)) && eventIntersects(event, start, end, resource)) {
        let chunk = createEventChunk(event, start, end);
        switch (event.display) {
          case 'background':
            newBgChunks.push(chunk);
            break;
          default:
            newChunks.push(chunk);
        }
      }
    }

    groupEventChunks(newChunks);

    chunks.set(newChunks);
    bgChunks.set(newBgChunks);

  });

  const iChunks = $derived(
    $_iEvents.map((event) =>
      event && eventIntersects(event, start, end, resource)
        ? createEventChunk(event, start, end)
        : null
    )
  );

  const isToday = $derived(datesEqual(date, $_today));
  const highlight = $derived(
    $highlightedDates.some((d) => datesEqual(d, date))
  );

  function dateFromPoint(x, y) {
    y -= rect(el).top;
    return {
      allDay: false,
      date: addDuration(
        addDuration(cloneDate(date), $_slotTimeLimits.min),
        $slotDuration,
        floor(y / $slotHeight)
      ),
      resource,
      dayEl: el,
    };
  }

  $effect(() => {
    if (el) {
      setPayload(el, dateFromPoint);
    }
  });
</script>

<div
  bind:this={el}
  class="{$theme.day} {$theme.weekdays?.[date.getUTCDay()]}{isToday
    ? ' ' + $theme.today
    : ''}{highlight ? ' ' + $theme.highlight : ''}"
  role="cell"
  onpointerleave={(e) => {
    //console.log($_interaction.pointer?.leave);
    $_interaction.pointer?.leave?.(e);
  }}
  onpointerdown={(e) => {
    //console.log($_interaction.action?.select);
    $_interaction.action?.select?.(e);
  }}
>
  <div class={$theme.bgEvents}>
    {#each $bgChunks as chunk (chunk.event)}
      <Event {date} {chunk} />
    {/each}
  </div>
  <div class={$theme.events}>
    <!-- Pointer -->
    {#if iChunks[1]}
      <Event {date} chunk={iChunks[1]} />
    {/if}
    {#each $chunks as chunk (chunk.event)}
      <Event {date} {chunk} />
    {/each}
    <!-- Drag, Resize & Select -->
    {#if iChunks[0] && !iChunks[0].event.allDay}
      <Event {date} chunk={iChunks[0]} />
    {/if}
  </div>
  <div class={$theme.extra}>
    <!-- Now indicator -->
    {#if $nowIndicator && isToday}
      <NowIndicator />
    {/if}
  </div>
</div>

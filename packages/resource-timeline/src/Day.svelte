<script>
    import {getContext} from 'svelte';
    import {
        cloneDate,
        addDuration,
        datesEqual,
        max,
        floor,
        ceil,
        rect,
        setPayload,
        toSeconds,
        runReposition
    } from '@event-calendar/core';
    import {getSlotTimeLimits} from './lib.js';
    import Event from './Event.svelte';

    let {
        date: date,
        resource: resource,
        chunks: chunks,
        bgChunks: bgChunks,
        longChunks: longChunks,
        iChunks: iChunks = []
    } = $props();

    let {highlightedDates, slotDuration, slotWidth, theme, _interaction, _today, _dayTimeLimits} = getContext('state');

    let el = $state();
    let dayChunks, dayBgChunks;
    let isToday, highlight;
    let refs = $state([]);
    let slotTimeLimits = $state();
    let allDay = $state();
    let pointerIdx = $state(1);

    let start = $state(), end = $state();

    $effect(() => {
        slotTimeLimits = getSlotTimeLimits($_dayTimeLimits, date);
        start = addDuration(cloneDate(date), slotTimeLimits.min);
        end = addDuration(cloneDate(date), slotTimeLimits.max);
    });

    $effect(() => {
        allDay = !toSeconds($slotDuration);
        pointerIdx = allDay ? 2 : 1;
    });

    dayChunks = $derived(chunks.filter(chunkIntersects));

    dayBgChunks = $derived(
        bgChunks.filter(bgChunk => (!allDay || bgChunk.event.allDay) && chunkIntersects(bgChunk))
    );

    function chunkIntersects(chunk) {
        return datesEqual(chunk.date, date);
    }

    isToday = $derived(datesEqual(date, $_today));
    highlight = $derived($highlightedDates.some(d => datesEqual(d, date)));

    function dateFromPoint(x, y) {
        x -= rect(el).left;
        return {
            allDay,
            date: allDay
                ? cloneDate(date)
                : addDuration(
                    addDuration(cloneDate(date), slotTimeLimits.min),
                    $slotDuration,
                    floor(x / $slotWidth)
                ),
            resource,
            dayEl: el
        };
    }

    $effect(() => {
        if (el) {
            setPayload(el, dateFromPoint);
        }
    });

    export function reposition() {
        return max(...runReposition(refs, dayChunks));
    }
</script>

<div
    bind:this={el}
    class="{$theme.day} {$theme.weekdays?.[date.getUTCDay()]}{isToday ? ' ' + $theme.today : ''}{highlight ? ' ' + $theme.highlight : ''}"
    style="flex-grow: {allDay ? null : ceil((toSeconds(slotTimeLimits.max) - toSeconds(slotTimeLimits.min)) / toSeconds($slotDuration))}"
    role="cell"
    on:pointerleave={$_interaction.pointer?.leave}
    on:pointerdown={$_interaction.action?.select}
>
    <div class="{$theme.events}">
        {#each dayBgChunks as chunk (chunk.event)}
            <Event {date} {chunk}/>
        {/each}
        <!-- Pointer -->
        {#if iChunks[pointerIdx] && datesEqual(iChunks[pointerIdx].date, date)}
            <Event {date} chunk={iChunks[pointerIdx]}/>
        {/if}
        {#each dayChunks as chunk, i (chunk.event)}
            <Event {date} {chunk} {dayChunks} {longChunks} {resource} bind:this={refs[i]}/>
        {/each}
        <!-- Drag, Resize & Select -->
        {#if iChunks[0] && datesEqual(iChunks[0].date, date)}
            <Event {date} chunk={iChunks[0]} {resource}/>
        {/if}
    </div>
</div>
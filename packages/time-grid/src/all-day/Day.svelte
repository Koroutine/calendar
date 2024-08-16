<script>
    import {getContext} from 'svelte';
    import {datesEqual, runReposition, setPayload} from '@event-calendar/core';
    import Event from './Event.svelte';

    let {
        date: date,
        chunks: chunks,
        bgChunks: bgChunks,
        longChunks: longChunks,
        iChunks: iChunks = [],
        resource: resource = undefined
    } = $props();

    let {highlightedDates, theme, _interaction, _today} = getContext('state');

    let el = $state();
    let refs = $state([]);

    const dayChunks = $derived(chunks.filter(chunk => datesEqual(chunk.date, date)));
    const dayBgChunks = $derived(bgChunks.filter(bgChunk => datesEqual(bgChunk.date, date)));
    const isToday = $derived(datesEqual(date, $_today));
    const highlight = $derived($highlightedDates.some(d => datesEqual(d, date)));

    $effect(() => {
        if (el) {
            setPayload(el, () => ({allDay: true, date, resource, dayEl: el}));
        }
    });

    export function reposition() {
        runReposition(refs, dayChunks);
    }
</script>

<div
    bind:this={el}
    class="{$theme.day} {$theme.weekdays?.[date.getUTCDay()]}{isToday ? ' ' + $theme.today : ''}{highlight ? ' ' + $theme.highlight : ''}"
    role="cell"
    onpointerleave={$_interaction.pointer?.leave}
    onpointerdown={$_interaction.action?.select}
>
    <div class="{$theme.bgEvents}">
        {#each dayBgChunks as chunk (chunk.event)}
            <Event {chunk}/>
        {/each}
    </div>
    <!-- Drag, Resize & Select -->
    {#if iChunks[0] && datesEqual(iChunks[0].date, date)}
        <div class="{$theme.events} {$theme.preview}">
            <Event chunk={iChunks[0]}/>
        </div>
    {/if}
    <div class="{$theme.events}">
        {#each dayChunks as chunk, i (chunk.event)}
            <Event {chunk} {longChunks} bind:this={refs[i]}/>
        {/each}
    </div>
</div>

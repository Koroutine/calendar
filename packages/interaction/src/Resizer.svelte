<script>
    import {getContext} from 'svelte';
    import {bgEvent, helperEvent} from '@event-calendar/core';

    let {
        event: event
    } = $props();

    let {theme, eventDurationEditable, editable} = getContext('state');

    let resizable;

    resizable = $derived(!bgEvent(event.display) &&
        !helperEvent(event.display) && (
            (event.durationEditable ?? $eventDurationEditable) ||
            (event.editable ?? $editable)
        ));
</script>

{#if resizable}
    <div
        class="{$theme.resizer}"
        on:pointerdown
    ></div>
{/if}
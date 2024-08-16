<script>
    import {getContext, tick} from 'svelte';
    import {is_function} from './utils.js';
    import {datesEqual, setContent, createEventChunk, addDay, cloneDate, assign, setPayload, toISOString,
        keyEnter, runReposition} from '@event-calendar/core';
    import Event from './Event.svelte';
    import Popup from './Popup.svelte';

    let {
        date: date,
        chunks: chunks,
        bgChunks: bgChunks,
        longChunks: longChunks,
        iChunks: iChunks = [],
        dates: dates
    } = $props();

    let {date: currentDate, dayMaxEvents, highlightedDates, moreLinkContent, theme,
        _hiddenEvents, _intlDayCell, _popupDate, _popupChunks, _today, _interaction, _queue} = getContext('state');

    let el = $state();
    let dayChunks = $state(), dayBgChunks = $state();
    let otherMonth = $state();
    let highlight = $state();
    let hiddenEvents = $state(new Set());  // hidden events of this day
    let moreLink = $state('');
    let refs = $state([]);

    $effect(() => {
        $_hiddenEvents[date.getTime()] = hiddenEvents;
    })

    $effect(() => {
        dayChunks = [];
        dayBgChunks = bgChunks.filter(bgChunk => datesEqual(bgChunk.date, date));
        hiddenEvents.clear();
        hiddenEvents = hiddenEvents;
        for (let chunk of chunks) {
            if (datesEqual(chunk.date, date)) {
                dayChunks.push(chunk);
                // if ($dayMaxEvents !== false && dayChunks.length > $dayMaxEvents) {
                // 	chunk.hidden = true;
                // }
            }
        }
    });

    const isToday = $derived(datesEqual(date, $_today));

    $effect(() => {
        otherMonth = date.getUTCMonth() !== $currentDate.getUTCMonth();
        highlight = $highlightedDates.some(d => datesEqual(d, date));
    });

    $effect(() => {
        if ($_hiddenEvents && hiddenEvents.size) {  // make Svelte update this block on $_hiddenEvents update
            let text = '+' + hiddenEvents.size + ' more';
            if ($moreLinkContent) {
                moreLink = is_function($moreLinkContent)
                    ? $moreLinkContent({num: hiddenEvents.size, text})
                    : $moreLinkContent;
            } else {
                moreLink = text;
            }
        }
    });

    const showPopup = $derived($_popupDate && datesEqual(date, $_popupDate));

    $effect(() => {
        if (showPopup && longChunks && dayChunks) {
            // Let chunks to reposition then set popup chunks
            tick().then(setPopupChunks);
        }
    });

    $effect(() => {
        if (el) {
            setPayload(el, () => ({allDay: true, date, resource: undefined, dayEl: el}));
        }
    });

    function showMore() {
        $_popupDate = date;
    }

    function setPopupChunks() {
        let nextDay = addDay(cloneDate(date));
        let chunks = dayChunks.concat(longChunks[date.getTime()]?.chunks || []);
        $_popupChunks = chunks
            .map(chunk => assign({}, chunk, createEventChunk(chunk.event, date, nextDay), {days: 1, dates: [date]}))
            .sort((a, b) => a.top - b.top);
    }

    export function reposition() {
        runReposition(refs, dayChunks);
    }
</script>

<div
    bind:this={el}
    class="{$theme.day} {$theme.weekdays?.[date.getUTCDay()]}{isToday ? ' ' + $theme.today : ''}{otherMonth ? ' ' + $theme.otherMonth : ''}{highlight ? ' ' + $theme.highlight : ''}"
    role="cell"
    on:pointerleave={$_interaction.pointer?.leave}
    on:pointerdown={$_interaction.action?.select}
>
    <time
        class="{$theme.dayHead}"
        datetime="{toISOString(date, 10)}"
        use:setContent={$_intlDayCell.format(date)}
    ></time>
    <div class="{$theme.bgEvents}">
        {#each dayBgChunks as chunk (chunk.event)}
            <Event {chunk}/>
        {/each}
    </div>
    <!-- Pointer -->
    {#if iChunks[2] && datesEqual(iChunks[2].date, date)}
        <div class="{$theme.events}">
            <Event chunk={iChunks[2]}/>
        </div>
    {/if}
    <!-- Drag & Resize -->
    {#if iChunks[0] && datesEqual(iChunks[0].date, date)}
        <div class="{$theme.events} {$theme.preview}">
            <Event chunk={iChunks[0]}/>
        </div>
    {/if}
    <div class="{$theme.events}">
        {#each dayChunks as chunk, i (chunk.event)}
            <Event {chunk} {longChunks} {dates} bind:this={refs[i]} />
        {/each}
    </div>
    {#if showPopup}
        <Popup/>
    {/if}
    <div class="{$theme.dayFoot}">
        {#if hiddenEvents.size}
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-missing-content -->
            <a
                role="button"
                tabindex="0"
                aria-haspopup="true"
                on:click|stopPropagation={showMore}
                on:keydown={keyEnter(showMore)}
                on:pointerdown|stopPropagation
                use:setContent={moreLink}
            ></a>
        {/if}
    </div>
</div>

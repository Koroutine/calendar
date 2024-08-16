<script>
    import {getContext} from 'svelte';
    import Section from './Section.svelte';

    let {_bodyEl, _viewDates, _slotTimeLimits, _times, scrollTime, slotDuration, slotHeight, theme} = getContext('state');

    let el = $state();
    let compact = $state();
    let lines = $state([]);

    const $_bodyEl = $derived(el);

    $effect(() => {
        compact = $slotDuration.seconds >= 3600;
        lines.length = $_times.length;
    });

    $effect(() => {
        if (el) {
            $_viewDates;
            $scrollTime;
            scrollToTime()
        }
    });

    function scrollToTime() {
        el.scrollTop = (($scrollTime.seconds - $_slotTimeLimits.min.seconds) / $slotDuration.seconds - 0.5) * $slotHeight;
    }
</script>

<div
    bind:this={el}
    class="{$theme.body}{compact ? ' ' + $theme.compact : ''}"
>
    <div class="{$theme.content}">
        <Section>
            <svelte:fragment slot="lines">
                {#each lines as line}
                    <div class="{$theme.line}"></div>
                {/each}
            </svelte:fragment>
            <slot></slot>
        </Section>
    </div>
</div>

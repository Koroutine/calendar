<script>
    import {getContext} from 'svelte';
    import {is_function} from 'lib/utils';
    import {debounce, toISOString, toLocalDate, toViewWithLocalDates} from './lib.js';

    let {datesSet, _auxiliary, _activeRange, _queue, _view} = getContext('state');

    $effect(() => {
        runDatesSet($_activeRange);
    });

    let debounceHandle = $state({});
    function runDatesSet(_activeRange) {
        if (is_function($datesSet)) {
            debounce(() => $datesSet({
                start: toLocalDate(_activeRange.start),
                end: toLocalDate(_activeRange.end),
                startStr: toISOString(_activeRange.start),
                endStr: toISOString(_activeRange.end),
                view: toViewWithLocalDates($_view)
            }), debounceHandle, _queue);
        }
    }
</script>

{#each $_auxiliary as component}
    <svelte:component this={component} />
{/each}

<script>
    import {getContext, onMount, createEventDispatcher} from 'svelte';
    import {is_function} from './utils.js';
    import {setContent, toLocalDate} from '@event-calendar/core';

    let {
        resource: resource,
        date: date = undefined
    } = $props();

    let {resourceLabelContent, resourceLabelDidMount, _intlDayHeaderAL} = getContext('state');

    const dispatch = createEventDispatcher();

    let el = $state();
    let content = $state();
    let ariaLabel = $state();

    $effect(() => {
        if ($resourceLabelContent) {
            content = is_function($resourceLabelContent)
                ? $resourceLabelContent({
                    resource,
                    date: date ? toLocalDate(date) : undefined,
                })
                : $resourceLabelContent;
        } else {
            content = resource.title;
        }
    });

    onMount(() => {
        if (is_function($resourceLabelDidMount)) {
            $resourceLabelDidMount({
                resource,
                date: date ? toLocalDate(date) : undefined,
                el
            });
        }
    });

    $effect(() => {
        if (date) {
            ariaLabel = $_intlDayHeaderAL.format(date) + ', ' + el.innerText;
        } else {
            ariaLabel = undefined;
            dispatch('text', el.innerText);
        }
    });
</script>

<span
    bind:this={el}
    aria-label="{ariaLabel}"
    use:setContent={content}
></span>

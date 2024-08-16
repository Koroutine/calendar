<script>
    import {getContext} from 'svelte';
    import {bgEvent, helperEvent} from '@event-calendar/core';
    import Action from './Action.svelte';
    import Pointer from './Pointer.svelte';
    import Resizer from './Resizer.svelte';
    import { onDestroy } from 'svelte';

    let {theme, editable, eventStartEditable, eventDurationEditable, pointer, _bodyEl,
        _interaction, _iClasses, _draggable} = getContext('state');

    $_interaction.resizer = Resizer;

    $_draggable = 
        event => (event.startEditable ?? $eventStartEditable) || (event.editable ?? $editable)
   

    $_iClasses = (className, event) => {
        let {display} = event;
        return helperEvent(display) ? [$theme[display]] : (!bgEvent(display) && $_draggable(event) ? [$theme.draggable] : []);
    }

    $effect(() => {
        if ($_bodyEl) {
            $_bodyEl.addEventListener('scroll', bodyScrollHandler);

            // Cleanup when the component is destroyed
            onDestroy(() => {
                $_bodyEl.removeEventListener('scroll', bodyScrollHandler);
            });
        }
    });

    function bodyScrollHandler() {
        for (let component of Object.values($_interaction)) {
            component?.handleScroll?.();
        }
    }
</script>

<Action bind:this={$_interaction.action}/>
{#if $pointer}
    <Pointer bind:this={$_interaction.pointer}/>
{/if}

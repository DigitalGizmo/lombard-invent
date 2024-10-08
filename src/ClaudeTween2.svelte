<script>
  import { tweened } from 'svelte/motion';

  let radius = tweened(0);
  let firstTweenComplete = false;
  let secondTweenComplete = false;

  function startFirstTween() {
    // First tween: Expand the circle over 2 seconds
    radius.set(100, { duration: 2000 }).then(() => {
      firstTweenComplete = true;
    });
  }

  function startSecondTween() {
    if (firstTweenComplete) {
      // Second tween: Shrink the circle over 1 second
      radius.set(50, { duration: 1000 }).then(() => {
        secondTweenComplete = true;
      });
    }
  }

  // Start the first tween immediately when the component mounts
  startFirstTween();
</script>

<svg width="200" height="200">
  <circle cx="100" cy="100" r={$radius} fill="purple" />
</svg>

<button on:click={startSecondTween} disabled={!firstTweenComplete || secondTweenComplete}>
  Start Second Tween
</button>

{#if firstTweenComplete}
  <p>First tween complete!</p>
{/if}

{#if secondTweenComplete}
  <p>Second tween complete!</p>
{/if}

<style>
  svg {
    background-color: #f0f0f0;
    margin-bottom: 10px;
  }
  button {
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
</style>
<script>
  import { onMount } from 'svelte'; //, tick
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '@neodrag/svelte';

  import challenges from './lib/challenges.json';
  const assetPath = "https://dev.digitalgizmo.com/msm-ed/lombard-invent-assets/"
  // const assetPath = ""

  let challengeIndex = 0;
  const movementDuration = 2000; // 5000

  const cloudsX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });
  const landX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });

  // movement
  async function nextMove() {
    // stillHauling = true;
    // $haulerX + 300;
    // await haulerX.update((haulerX) => haulerX + 10);
    landX.update((landX) => landX - 15);
    await cloudsX.update((cloudsX) => cloudsX - 8);
    // stillHauling = false;
    challengeIndex +=1;
  }

</script>

<div class="wrapper">

  <div class="background">
    <img class="sky" src="{assetPath}images/sky-double.jpg"  alt="sky" 
      style="transform:translate({$cloudsX}vw, 0px)"
    />
    <img class="land" src="{assetPath}images/landscape-double.png" alt="land" 
      style="transform:translate({$landX}vw, 0px)"
    />
  </div>

  <header>
    <h1>Be An Inventor</h1>
    <ul class="progress">
      <li>1</li>
      <li>2</li>
      <li>3</li>
      <li>4</li>
      <li>5</li>
    </ul>
  </header>

  <div class="hauler">
    <img src="{assetPath}images/lumber.png" alt="lumber" />
    <img src="{assetPath}images/horses.png" alt="horses" />
  </div>

  <article>
    <h2>{challenges[challengeIndex].title}</h2>
    <p>{challenges[challengeIndex].question} </p>

    {#if challengeIndex === 0}
      <button on:click={nextMove}>
        start
      </button>

    {/if}    
  </article>

  <div class="options">
    <div class="option1">
      <img src="{assetPath}images/option-oxen.png" alt="option 1: oxen" />
      <h3>Oxen</h3>
    </div>
    <div class="option2">
      <img src="{assetPath}images/option-steam-tractor.png" alt="option 2: steam" />
      <h3>Steam Tractor</h3>
    </div>
    <div class="option3">
      <img src="{assetPath}images/option-trolly.png" alt="option 3: trolly" />
      <h3>Electric Trolly</h3>
    </div>
  </div>
  
</div><!--/wrapper-->
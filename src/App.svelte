<script>
  import { onMount } from 'svelte'; //, tick
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '@neodrag/svelte';

  import challenges from './lib/challenges.json';
  const assetPath = "https://dev.digitalgizmo.com/msm-ed/lombard-invent-assets/"
  // const assetPath = ""
  let challengeIndex = 1;
  const movementDuration = 2000; // 5000
  let vwidth = 1200;
  let vheight = 800;

  let choiceObjectBounds = {top: 100, left:20, bottom:50, right:50};
  let positionA = { x: 0, y: 0};

  let haulerX = 600;
  let haulerY = 400;
  let option1VX = 300;
  // let option1LandingX = 20;
  let option1LandingXOffset = 18;

  onMount(() => {
    vwidth = Math.max(document.documentElement.clientWidth || 
      0, window.innerWidth || 0);
    vheight = Math.max(document.documentElement.clientHeight || 
      0, window.innerHeight || 0);
    // get the hauler (the horse part) location in x and y
    let hauler = document.getElementById('hauler');
    let rect = hauler.getBoundingClientRect();
    haulerX = rect.right;
    // option1
    let option1 = document.getElementById('option1');
    let rect1 = option1.getBoundingClientRect();
    option1VX = rect1.right;
    option1LandingXOffset = haulerX - rect1.right;    
  })

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

  function dragStop(e) {
    /* move to onMount when we have an invisible option1 to start with */
    // let option1 = document.getElementById('option1');
    // let rect1 = option1.getBoundingClientRect();
    // option1VX = rect1.right;
    // option1LandingXOffset = haulerX - rect1.right;

    /* Landing position of a given option is relative to its start point
    * not relative to the viewport */
    console.log('stoped at x: ' + e.detail.offsetX + ' y: ' +
      e.detail.offsetY)
    if (e.detail.offsetX > .03*vwidth && e.detail.offsetX < .24*vwidth 
    // &&e.detail.offsetY > -290 && e.detail.offsetY < -230
    ) {
      // stick on target
      positionA = {x: option1LandingXOffset/1.8, y: -.33*vheight}
      // positionA = {x: 0, y: -.33*vheight}
      // positionA = {x: haulerX, y: haulerY}
    } else { // back to home base
      positionA = {x: 0, y: 0} // defaultBx
    }
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
    <img src="{assetPath}images/horses.png" alt="horses" id="hauler"/>
  </div>

  <article>
    <h2>{challenges[challengeIndex].title}</h2>
    <p>{challenges[challengeIndex].question} </p>

    {#if challengeIndex === 0}
      <button on:click={nextMove}>
        start
      </button>
    {/if}    
    -- vwidth: {vwidth} haulerX: {haulerX} option1VX: {option1VX}
    option1LandingXOffset: {option1LandingXOffset}
  </article>

  {#if challengeIndex === 1}
    <div class="options">
      <div class="option1">
        <img src="{assetPath}images/option-oxen.png" 
          id="option1" alt="option 1: oxen" 
          use:draggable={{ 
            position: positionA,
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              positionA = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={dragStop}      
        />
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
  {/if}
  
</div><!--/wrapper-->
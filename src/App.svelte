<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '@neodrag/svelte';

  import challenges from './lib/challenges.json';
  import clouds from './assets/images/sky.png'
  import clouds_double from './assets/images/sky-double.jpg'
  import landscape from './assets/images/landscape.png'
  import landscape_double from './assets/images/landscape-double.png'
  import lumber from './assets/images/lumber.png'
  import horses from './assets/images/horses.png'
  import power_oxen from './assets/images/option-oxen.png'
  import power_steam from './assets/images/option-steam-tractor.png'
  import power_trolly from './assets/images/option-trolley.png'
  import power_kaput from './assets/images/horses-kaput.png'

  let frameHeight = 900;
  let popQuestion = false;
  
  let challengeIndex = -1;
  // let question = challenges[0].question;
  const movementDuration = 6000;

  const haulerX = tweened(100, {
    duration: movementDuration,
    easing: cubicOut
  });
  
  let stillHauling = false;

  async function handleHauler() {
  // function handleHauler() {
    stillHauling = true;
    // $haulerX += 300;
    landX.update((landX) => landX - 400);
    cloudsX.update((cloudsX) => cloudsX - 200);
    await haulerX.update((haulerX) => haulerX + 200);
    stillHauling = false;
    challengeIndex +=1;
  }

  const landX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });

  const cloudsX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });


  // $: if ($haulerX === 600) {popQuestion = true}

  function dragStopped(e) {
    console.log('neodrag stop function', e)
  }

  function dragStop(e) {
    console.log('stoped at x: ' + e.detail.offsetX + ' y: ' +
      e.detail.offsetY)
    if (e.detail.offsetX > 300 && e.detail.offsetX < 400 &&
    e.detail.offsetY > -270 && e.detail.offsetY < -250
    ) {
      positionB = {x: 350, y: -260}
    } else {
      positionB = {x: 550, y: 0}
    }
  }

  let choiceObjectBounds = {top: 100, left:20, bottom:200, right:100};
  // let choiceObjectBounds = ".image-panel-image";
  let positionB = { x: 500, y: 0};

</script>

<main>
  <div>
    <h1>Be the Inventor</h1>

    <button on:click={handleHauler}>
      start
    </button>
    <p>
      <!-- stillHauling: {stillHauling} -->
      {#if challengeIndex > -1}
        {challenges[challengeIndex].question}
      {:else}
        --
      {/if}
    </p>
  </div>

  <div class="image-panel"> <!-- like image-panel -->
    <div class="image-panel-fixed">
      <div class="image-panel-image">
        <svg viewBox="0 0 2000 1286" preserveAspectRatio="xMidYMid slice">

          <image width="3500px" href="{clouds_double}"
            transform="translate({$cloudsX} 0)" 
          />
          <!-- {cloudsTransX} , scale(2.8) -->
          <image width="4000px" href="{landscape_double}" 
            transform="translate({$landX} 0)" 
          />
          <!-- hauler -->
          <g transform="translate({$haulerX} 400)">
            <image  href="{lumber}"/>
            <!-- width="200px" -->
            <g  transform="translate(220 -120)">
              {#if challengeIndex === -1}
                <image href="{horses}"/>
              {:else if challengeIndex === 0}
                <image href="{power_kaput}"/>
              {/if}
            </g>
          </g>
          {#if challengeIndex === 0}
            <g transform="translate(300 600)">
              <image href="{power_oxen}" 
                use:draggable={{ 
                  defaultPosition: { x: 180, y: 0 }, 
                  bounds: {top: 100, left:20, bottom:200, right:100} 
                }} 
                on:neodrag:end={(e) => console.log('dragging stopped', e)}
              />
              <image class="choice-object" href="{power_steam}" 
                use:draggable={{ 
                  position: positionB,
                  bounds: choiceObjectBounds,
                  onDrag: ({offsetX, offsetY}) => {
                    positionB = {x: (offsetX*2)-550, y: offsetY*2};
                  }
                }}
                on:neodrag:end={dragStop}
              />
              <image href="{power_trolly}"  width="250"
                use:draggable={{ position: { x: 800, y: 0} }}
                on:neodrag:end={dragStopped}
                />
            </g>
          {/if}
        </svg>
      </div> <!-- end image panel image -->
    </div> <!-- /image-panel-fixed -->
  </div>

  <!-- on:neodrag:end={dragStopped} -->
  <!-- on:neodrag:end={(e) => positionB = {x: 550, y: 0}} -->

</main>

<style>


</style>

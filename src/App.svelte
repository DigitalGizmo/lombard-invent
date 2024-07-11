<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  import clouds from './assets/images/sky.png'
  import landscape from './assets/images/landscape.png'
  import lumber from './assets/images/lumber.png'
  import horses from './assets/images/horses.png'
  import Counter from './lib/Counter.svelte'

  let frameHeight = 900;

  // const size = tweened(1, {
  //   duration: 300,
  //   easing: cubicOut
  // });
  // function handleClick() {
  //   $size += 1;
  // }

  const haulerX = tweened(200, {
    duration: 2000,
    easing: cubicOut
  });
  
  // let stillHauling = false;
  let popQuestion = false;

  // async function handleHauler() {
  function handleHauler() {
    // popQuestion = true;
    $haulerX = 600;
    // await $haulerX === 600;
    // stillHauling = false;
    // callback when finished?
  }

  $: if ($haulerX === 600) {popQuestion = true}

</script>

<main>
  <div>
    <h1>Be the Inventor</h1>
    <!-- <Counter /> -->

    <!-- <button on:click={handleClick} 
    style="transform: scale({$size}); transform-origin: 0 0">
      embiggen
    </button> -->
    
    <button on:click={handleHauler}>
      start
    </button>
    <!-- popQuestion: {popQuestion} -->
    {#if popQuestion}
    <p>Horses don't cut it, what would be better?</p>
    {/if}
  </div>

  <div> <!-- like image-panel -->
    <div class="image-panel-fixed">
      <div class="image-panel-image">
        <svg viewBox="0 0 2000 1286" preserveAspectRatio="xMidYMid slice">

          <image width="100%" href="{clouds}"
            transform="translate(0 0)" 
          />
          <!-- {cloudsTransX} , scale(2.8) -->
          <image width="100%" href="{landscape}"
            transform="translate(100 0)" 
          />
          <!-- hauler -->
          <g transform="translate({$haulerX} 400)">
            <image  href="{lumber}"/>
            <!-- width="200px" -->
            <image href="{horses}"
              transform="translate(220 -120)"
            />
            
          </g>
        </svg>
      </div> <!-- end image panel image -->
    </div> <!-- /image-panel-fixed -->
  </div>
</main>

<style>


</style>

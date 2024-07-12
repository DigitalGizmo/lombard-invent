<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  import challenges from './lib/challenges.json';
  import clouds from './assets/images/sky.png'
  import landscape from './assets/images/landscape.png'
  import lumber from './assets/images/lumber.png'
  import horses from './assets/images/horses.png'
  import power_oxen from './assets/images/option-oxen.png'
  import power_steam from './assets/images/option-steam-tractor.png'
  import power_trolly from './assets/images/option-trolley.png'
  import power_kaput from './assets/images/horses-kaput.png'

  let frameHeight = 900;

  const haulerX = tweened(100, {
    duration: 3000,
    easing: cubicOut
  });
  
  let popQuestion = false;

  let challengeIndex = -1;
  // let question = challenges[0].question;
  
  let stillHauling = false;
  async function handleHauler() {
  // function handleHauler() {
    stillHauling = true;
    // $haulerX += 300;
    await haulerX.update((haulerX) => haulerX + 200)
    stillHauling = false;
    challengeIndex +=1;
  }

  // $: if ($haulerX === 600) {popQuestion = true}

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
              <image href="{power_oxen}" transform="translate(300 0)"/>
              <image href="{power_steam}" transform="translate(550 0)"/>
              <image href="{power_trolly}" transform="translate(800 0)" width="250"/>
            </g>
          {/if}
        </svg>
      </div> <!-- end image panel image -->
    </div> <!-- /image-panel-fixed -->
  </div>
</main>

<style>


</style>

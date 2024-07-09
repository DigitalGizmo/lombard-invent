<script>
  // import svelteLogo from './assets/svelte.svg'
  import clouds from './assets/images/sky.png'
  import landscape from './assets/images/landscape.png'
  import lumber from './assets/images/lumber.png'
  import horses from './assets/images/horses.png'
  import Counter from './lib/Counter.svelte'

  let frameHeight = 900;

</script>

<main>
  <div>
    <h1>Be the Inventor</h1>
    <Counter />
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
          <g transform="translate(600 400)">
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

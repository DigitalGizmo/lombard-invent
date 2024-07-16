<script>
    import { draggable } from '@neodrag/svelte';
</script>

<main>

  <div class="shape"
  use:draggable >
    move me
  </div>

  <div >
    <img use:draggable class="draggableImage"
    src="images/option-oxen.png" alt="test non svg"/>
  </div>

  <div>
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
      <image href="images/option-oxen.png"
        use:draggable 
       />
    </svg>
  </div>

</main>

<style>
  .draggableImage{
    width: 20%;
    -webkit-user-drag: none;
  }
  .shape {
    width: 200px;
    height: 200px;
    background-color: red;
  }

</style>
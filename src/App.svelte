<script>

  import challenges from './lib/challenges.json';
  const assetPath = "https://dev.digitalgizmo.com/msm-ed/lombard-invent-assets/"
  // const assetPath = ""

</script>

<div class="wrapper">

  <div class="background">
    <img class="sky" src="{assetPath}images/sky-double.jpg" alt="sky" />
    <img class="land" src="{assetPath}images/landscape-double.png" alt="landscape" />
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
    <h2>The Power Problem</h2>
    <p>{challenges[0].question} Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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
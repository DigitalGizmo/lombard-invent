<script>

  import challenges from './lib/challenges.json';
  const assetPath = "https://dev.digitalgizmo.com/msm-ed/lombard-invent-assets/"
  // const assetPath = ""

</script>

<div>
  <h1>Be the Inventor</h1>

  <img  src="{assetPath}images/sky-double.jpg"  alt="sky" />

  <img  src="{assetPath}images/landscape-double.png"  alt="landscape" />

  <img  src="{assetPath}images/lumber.png"  alt="lumber" />
  <img  src="{assetPath}images/horses.png"  alt="horses" />
  
  <p>{challenges[0].question}</p>

  <img  src="{assetPath}images/option-oxen.png"  alt="oxen" />
  <img  src="{assetPath}images/option-steam-tractor.png"  alt="steam" />
  <img  src="{assetPath}images/option-trolly.png"  alt="trolly" />
  
</div>
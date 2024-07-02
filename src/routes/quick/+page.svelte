<div class="grid grid-cols-3 min-h-screen w-full gap-8 p-8">
  <!-- sidebar -->
  <div class="col-span-1">
    <div class="sidebar">
      <div class="sidebar-header">
        <h1 class="text-2xl font-bold">Quick</h1>
      </div>
      <div class="sidebar-content">
        <ul class="nav">
          <li class="nav-item">
            <a href="/quick" class="nav-link">Home</a>
          </li>
          <li class="nav-item">
            <a href="/quick/detailed" class="nav-link">Detailed</a>
          </li>
          <li class="nav-item">
            <a href="/quick/comprehensive" class="nav-link">Comprehensive</a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="col-span-2">
    <main class="rounded-box shadow-xl bg-base-100 w-full h-full p-10">
      <h2 class="font-bold text-4xl">Test</h2>
    </main>
  </div>
</div>

<style lang="postcss">
  main {
    view-transition-name: quick;
  }
</style>

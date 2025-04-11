<script setup></script>

<template>
  <div class="bookPackage">
    <div id="leftPart"></div>

    <div id="rightPart">
      <h1 class="font-bold text-xl">Package name</h1>
      <div class="mb-3 mt-2">
        <p class="text-left ml-5">Inclusion:</p>
        <ul class="text-left ml-8">
          <li>Swimming Pool</li>
          <li>Swimming Pool</li>
          <li>Swimming Pool</li>
          <li>Swimming Pool</li>
          <li>Swimming Pool</li>
          <li>Swimming Pool</li>
        </ul>
      </div>
      <div class="flex gap-20 w-[100%]">
        <h1 class="font-bold">Price: PHP 12,000.00</h1>
        <button
          class="border-1 rounded-lg w-20 font-bold bg-[#194d1d] text-white"
        >
          AVAIL
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookPackage {
  background-color: white;
  text-align: center;
  margin: auto;
  border: 1px solid black;
  border-radius: 10px;
  display: inline-flex;
  width: 40rem;
  padding: 10px;
}

#rightPart {
  margin: auto;

  width: auto;
  position: relative;
}

#leftPart {
  position: relative;
  background-color: grey;

  border-radius: 10px;
  width: 300px;
  margin-left: 5px;
}
</style>

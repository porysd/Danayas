<template>
    <div class="home">
        <h1>Welcome to the Home Page</h1>
        <p>This is the home page of the DREVS System.</p>
    </div>

    <div class="custom-shape-divider-bottom-1739172506">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
        </svg>
    </div>
</template>

<script>
export default {
    
name: 'Home',
     
  methods: {
    goToAbout() {
      this.$router.push('/About')
    },
  },
};

</script>

<style scoped>
.home { 
    text-align: center;
    margin-top: 50px;
}

h1 {
    color: #42b983;
}

p {
    font-size: 18px;
}

.custom-shape-divider-bottom-1739172506 {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
}

.custom-shape-divider-bottom-1739172506 svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 130px;
}

.custom-shape-divider-bottom-1739172506 .shape-fill {
    fill: #FFFFFF;
}
</style>
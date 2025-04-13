<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
</script>
<template>
  <NavBar />
  <div class="ContainerAbout">
    <img
      src="../assets/danayas_day.jpg"
      alt="package_image"
      id="about"
      class="aboutUs"
    />
    <h1 class="AboutText" style="text-align: center">Profile</h1>
  </div>

  <div class="profile-Container">
    <div class="mt-10">
      <div class="modify-container">
        <div>
          <label>Username:</label>
          <input class="packEvents" />
        </div>
        <div>
          <label>Email Address:</label>
          <input class="packEvents" />
        </div>
        <div>
          <label>First Name:</label>
          <input class="packEvents" />
        </div>
        <div>
          <label>Last Name:</label>
          <input class="packEvents" />
        </div>
        <div>
          <label>Contact Number:</label>
          <input class="packEvents" />
        </div>
        <div>
          <label>Address </label>
          <input class="packEvents" />
        </div>
        <button class="modifyBtn">Modify</button>
      </div>
      <div class="ChangePass">
        <h1 class="TitlePass">Change Password</h1>
        <div class="Pass-container">
          <div>
            <label> Old Password:</label>
            <input class="packEvents" placeholder="Current Password" />
          </div>
          <div>
            <label>New Password</label>
            <input class="packEvents" placeholder="New Password" />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input class="packEvents" placeholder="Confirm Password" />
          </div>
          <button class="ChangePassBtn">Modify</button>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>
.TitlePass {
  text-align: justify;
  font-size: 28px;
  font-weight: bold;
  font-family: "Poppins";
  display: flex;
  margin-left: 40px;
  position: relative;
  top: -3rem;
}
.ChangePassBtn {
  border: 1px solid green;
  width: 80rem;
  height: 4rem;
  background-color: #41ab5d;
  padding: 10px;
  border-radius: 10px;
  bottom: -2rem;
  margin-top: 2rem;
  color: white;
  font-weight: 600;
  font-family: "Poppins";
}

.Pass-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  align-items: center;
  margin: auto;
  position: relative;
  bottom: -2rem;
  top: -2rem;
  margin-left: 20px;
}
.modifyBtn {
  border: 1px solid green;
  width: 80rem;
  height: 4rem;
  background-color: #41ab5d;
  padding: 10px;
  border-radius: 15px;
  margin-top: 10px;
  color: white;
  font-weight: 600;
  font-family: "Poppins";
}
.modify-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  align-items: center;
  margin: auto;
  position: relative;
  top: -3rem;
  margin-left: 20px;
}
label {
  display: inline-block;
  position: absolute;
  font-size: 1.5rem;
  font-weight: 600;
}
input {
  border-radius: 10px;
  border: 1px solid green;
  background-color: aliceblue;
  padding: 10px;
  width: 60rem;
  margin-left: 14rem;
}
.profile-Container {
  border: none;
  height: 54rem;
  width: 85rem;
  align-items: center;
  justify-self: center;
  margin: auto;
  display: flex;
  margin-top: 8rem;
  border-radius: 15px;
  background-color: #c1f2b0;
}
img {
  width: 30px;
  height: 30px;
  position: static;
}
.ContainerAbout {
  position: relative;
  width: 85rem;
  justify-content: center;
  align-items: center;
  height: 400px;
  margin: auto;
  border-radius: 25px;
  overflow: hidden;
}
.aboutUs {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.AboutText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  font-weight: bold;
  color: white;
  text-shadow: 0px 4px 4px rgb(12, 70, 39);
  text-align: center;
}
</style>

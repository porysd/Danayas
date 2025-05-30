<script></script>
<template>
  <div
    class="flex-col flex justify-center items-center font-medium h-auto w-[100%] mt-5"
  >
    <div class="p-5 rounded-lg w-[70rem] h-auto mt-10 mb-10 gap-20">
      <div class="flex">
        <div>
          <img src="../Admin/assets/drevslogo.png" alt="" class="w-40 h-40" />
        </div>

        <div class="flex flex-col justify-center m-auto text-2xl">
          <h1
            class="font-black text-5xl flex align-center justify-center"
            style="font-style: 'Times New Roman'"
          >
            Danayas Resort Events Venue
          </h1>
          <h2>#27 Jones St. Extension, Dulong Bayan 2, San Mateo Rizal</h2>
          <h2 class="text-center">09912166870</h2>
        </div>
      </div>

      <div class="flex gap-130 relative">
        <div class="mb-2 p-2 rounded-sm">
          <div>
            <h1 class="font-bold font-[Poppins] mt-[2rem]">BILLED TO:</h1>
          </div>
          <div class="">
            <p>{{ userData.firstName }} {{ userData.lastName }}</p>
          </div>
          <div class="">
            <p>
              {{ userData.address }}
            </p>
          </div>
        </div>
        <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
          <div>
            <h1 class="font-bold font-[Poppins] mt-[2rem]">INVOICE NO.:</h1>
          </div>
          <div class="">
            <p>DATE:</p>
          </div>
        </div>
      </div>

      <Divider />

      <div class="flex gap-100 relative">
        <div class="mb-2 p-2 rounded-sm">
          <div>
            <h1 class="font-bold font-[Poppins] mt-[2rem]">
              Guest Information:
            </h1>
          </div>
          <div class="">
            <p>Name: {{ userData.firstName }} {{ userData.lastName }}</p>
          </div>
          <div class="">
            <p>Contact No.: {{ userData.contactNo }}</p>
          </div>
          <div class="">
            <p>Email Address: {{ userData.email }}</p>
          </div>
          <div class="">
            <p>Address: {{ userData.address }}</p>
          </div>
        </div>
        <div class="bg-[#fcfcfc] mb-2 p-2 rounded-sm">
          <div class="flex gap-2">
            <p>
              Date: {{ formatDates(newBooking.checkInDate) }} to
              {{ formatDates(newBooking.checkOutDate) }}
            </p>
          </div>
          <div class="flex gap-2">
            <p>Check-in: {{ formatDates(newBooking.checkInDate) }}</p>
          </div>
          <div class="flex gap-2">
            <p>Check-out: {{ formatDates(newBooking.checkOutDate) }}</p>
            <button class=""></button>
          </div>
          <div class="">
            <p>Mode: {{ newBooking.mode }}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <table>
          <thead>
            <tr class="">
              <th>Item</th>
              <th>REF ID</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="">{{ selectedPackage?.name }}</td>
              <td class="text-center">
                {{ selectedPackage?.packageId }}
              </td>
              <td class="text-center">
                {{ selectedPackage?.price }}
              </td>
              <td class="text-center">
                {{ formatPeso(selectedPackage?.price) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="w-full justify-items-end">
          <div class="mt-5 text-right w-[30%] mr-5">
            <h1>SubTotal: {{ formatPeso(selectedPackage?.price) }}</h1>
            <h1 class="mt-10">TAX(0%) : 0</h1>
            <Divider />
            <h1>
              <strong>TOTAL: </strong>{{ formatPeso(selectedPackage?.price) }}
            </h1>
          </div>
        </div>
        <div class="">
          <h1 class="mb-1 font-12 font-bold">Payment Information</h1>
          <h2>Account Name: Jason Isaac Mendoza</h2>
          <h2>Account No.: 09565187842</h2>
        </div>
      </div>

      <div class="flex pt-6 flex-col gap-2">
        <Button label="BOOK" iconPos="right" @click="openTermsAndCondition" />

        <Button
          label="BACK"
          severity="secondary"
          @click="
            activateCallback('3');
            prevBtn();
          "
        />
      </div>
    </div>
  </div>
</template>
<style scoped></style>

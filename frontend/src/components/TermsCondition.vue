<script setup>
import { ref } from "vue";
import Dialog from "primevue/dialog";

const showTermsAndConditionModal = ref(false);

const openTermsAndCondition = () => {
  showTermsAndConditionModal.value = true;
};
</script>
<template>
  <div class="card flex justify-center">
    <button
      label="TERMS & CONDITION"
      @click="openTermsAndCondition"
      class="terms-button"
    >
      TERMS & CONDITION
    </button>

    <Dialog
      v-model:visible="showTermsAndConditionModal"
      modal
      header="Terms & Conditions"
      class="terms-button"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <ol class="list-decimal list-inside space-y-2 text-black">
        <li>
          A downpayment Reservation fee of P 2000-3000.00 is required to ensure
          the client's specified schedule.
        </li>

        <li>
          Reservation in case of delay, shall be given an allowance of two (2)
          Days based on agreed time. Without prior notice, the management can
          cancel the reservation and forfeit the down payment after the
          allowable extension time.
        </li>
        <li>
          Reservation fee or down payment is non-refundable in case of
          cancellation.
        </li>
        <li>
          50% of the reservation fee or downpayment can be refundable in cases
          of cancellation due to natural disaster.
        </li>
        <li>
          In case of cancellation, the customer has the option to change the
          date and subject of availability in the area.
        </li>
        <li>
          Full contract payment should be made upon entrance on the day itself
          and excess charges shall be connected upon check—out.
        </li>
        <li>
          It is understood that the management is not responsible for any
          accident, injury, or loss that may occur during the tenure of the
          lease. The Customer waives the right to claim damages against the
          management.
        </li>
        <li>Food and Drinks are not allowed in the Pool hArea</li>
        <li>Swimming when drunk is strictly prohibited.</li>
        <li>Firearms and illegal substances are strictly prohibited</li>
        <li>Children must be always accompanied by adults.</li>
        <li>
          Excess guests will be charged depending on the chosen schedule. In
          Daytime (P100.00/ per head) Overnight (P 150.00/ per head)
        </li>
        <li>Pets are not allowed in the pool premises.</li>
        <li>
          It is our standard procedure to check items and equipment 30 minutes
          upon check—out of guests.
        </li>
        <li>
          Any loss or damage to property during the tenure of the lease shall be
          accounted to the customer.
        </li>
        <li>No refund policy is implemented</li>

        <li>
          <div>Clients must property observe the house rules</div>
        </li>
        <li>
          <div>
            It is understood that the customers agreed on the terms and
            conditions of the Danayas Resorts Events Venue.
          </div>
        </li>
      </ol>
    </Dialog>
  </div>
</template>
<style scoped>
.terms-button {
  display: flex;
  font-size: 15px;
  color: white;
  font-family: Poppins;
  font-weight: bold;
  text-align: center;
  margin-top: 2rem;
}
</style>

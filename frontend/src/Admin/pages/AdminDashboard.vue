<script setup>
import { ref, onMounted, computed } from 'vue';
import Chart from 'primevue/chart';
import DatePicker from 'primevue/datepicker';
import SideBar from '../components/SideBar.vue';
import DarkModeButton from '../components/DarkModeButton.vue';
import Notification from '../components/Notification.vue';
import "cally";

const bookings = ref([]);
const customers = ref([]);
const months = ref(new Array(12).fill(0));
const day = ref(new Array(31).fill(0));

// 1a211a 
// 0c170c
// Get All Booking and Customer with pagination
onMounted(async () => {

    const limit = 50;
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
        const bResponse = await fetch(`http://localhost:3000/bookings/bookings?limit=${limit}&page=${page}`);
        if(!bResponse.ok) throw new Error('Failed to fetch bookings');
        const bookingData = await bResponse.json();

        const cResponse = await fetch(`http://localhost:3000/users?limit=${limit}&page=${page}`);
        if(!cResponse.ok) throw new Error('Failed to fetch customers');
        const customerData = await cResponse.json();
                                                
        if (bookingData.items.length === 0 && customerData.items.length === 0) {
            hasMoreData = false;
        } else{
            bookings.value.push(...bookingData.items);
            customers.value.push(...customerData.items);
            page++;
        }
    }

    processBookings();
});

const totalCustomer = computed(() => customers.value.length);

// Process bookings to count booking occurences per month
const processBookings = () => {
    months.value = new Array(12).fill(0);

    bookings.value.forEach(booking => {
        if (booking.checkInDate){
            const monthIndex = new Date (booking.checkInDate).getMonth();
            months.value[monthIndex]++;
        }
    })

    updateChartData();
}

const chartData = ref({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
        {
            label: 'Reservations',
            data: months.value, 
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9966FF'],
            borderWidth: 2,
            borderRadius: 5,
            borderSkipped: false,
        }
    ]
});

const updateChartData = () => {
    chartData.value.datasets[0].data = [...months.value];
}

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top'
        }
    }
});

// Get PENDING Bookings
const countPendingBookings = computed(() => {
    return bookings.value.filter(b => 
        b.bookStatus && b.bookStatus.trim().toLowerCase() === 'pending'
    ).length;
});

// Get COMPLETED Booking Status
const countCompletedBookings = computed(() => {
    return bookings.value.filter(b => 
        b.bookStatus && b.bookStatus.trim().toLowerCase() === 'completed'
    ).length;
});

// Get RESCHEDULED Booking Status === NOT YET IMPLEMENTED!!!!
// const countRescheduledBooking = computed(() => {
//     return bookings.value.filter(b => 
//         b.bookStatus && b.bookStatus.trim().toLowerCase() === 'rescheduled'
//     ).length;
// });

// Get CANCELLED Booking Status
const countCancelledBookings = computed(() => {
    return bookings.value.filter(b => 
        b.bookStatus && b.bookStatus.trim().toLowerCase() === 'cancelled'
    ).length;
});

// Process booking days
const getBookingStyle = (slotDate) => {
    const jsDate = new Date(slotDate.year, slotDate.month - 1, slotDate.day); 

    const formattedDate = jsDate.toISOString().split('T')[0];

    const booking = bookings.value.find(b => b.checkInDate.startsWith(formattedDate));

    if (!booking) {
        return {
            backgroundColor: '#4BB344',
            color: 'white',
            width: '40px',
            height: '40px',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
        };
    }

    let backgroundColor;
    switch (booking.mode) {
        case 'day-time':
            backgroundColor = '#3EDFFF'; 
            break;
        case 'night-time':
            backgroundColor = '#1714BA'; 
            break;
        case 'whole-day':
            backgroundColor = '#FF2D55'; 
            break;
        default:
            backgroundColor = '#4BB344'; 
    }

    return {
        backgroundColor,
        color: 'white',
        width: '40px',
        height: '40px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
    };
};

// 4BB344
// FF2D55
// 3EDFFF
// 1714BA
</script>

<template>

    <main class="adminDash bg-[#EEF9EB] dark:bg-[#09090b]">
        <SideBar/>
        <div class="container">
            <div class="headers"> 
                <h1 class="text-5xl font-black">Dashboard</h1>
                <div class="flex items-center gap-4">
                    <DarkModeButton />
                    <Notification/>
                </div>
            </div>
            <div class="dSection">
                <div class="pendingBook p-4 md:p-5 shadow-lg bg-orange-50 dark:bg-orange-100/10">
                    <div class="flex justify-between mb-4">
                        <div>
                            <p class="text-xs uppercase text-gray-500">Pending<i class="pi pi-question-circle ml-2" 
                                                                                    style="font-size: 12px" 
                                                                                    v-tooltip="'Total Number of Pending'"/></p>
                            <h3 class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1">
                                {{ countPendingBookings }}
                            </h3>
                        </div>
                        <div class="flex items-center justify-center bg-orange-200 dark:bg-orange-400/10 rounded-xl" style="width:2.5rem; height:2.5rem;">
                            <i class="pi pi-spinner text-orange-600 !text-xl"/>
                        </div>
                    </div>
                </div>
                <div class="completedBook p-4 md:p-5 shadow-lg bg-green-50 dark:bg-green-100/10">
                    <div class="flex justify-between mb-4">
                        <div>
                            <p class="text-xs uppercase text-gray-500" icon >Completed<i class="pi pi-question-circle ml-2" 
                                                                                    style="font-size: 12px" 
                                                                                    v-tooltip="'Total Number of Completed'"/></p>
                            <h3 class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1">
                                {{ countCompletedBookings }}
                            </h3>
                        </div>
                        <div class="flex items-center justify-center bg-green-200 dark:bg-green-400/10 rounded-xl" style="width:2.5rem; height:2.5rem;">
                            <i class="pi pi-check-circle text-green-600 !text-xl"/>
                        </div>
                    </div>
                </div>
                <div class="cancelledBook p-4 md:p-5 shadow-lg bg-red-50 dark:bg-red-100/10">
                    <div class="flex justify-between mb-4">
                        <div>
                            <p class="text-xs uppercase text-gray-500">Cancelled<i class="pi pi-question-circle ml-2" 
                                                                                    style="font-size: 12px" 
                                                                                    v-tooltip="'Total Number of Cancelled'"/></p>
                            <h3 class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1"> 
                                {{ countCancelledBookings }}
                            </h3>
                        </div>
                        <div class="flex items-center justify-center bg-red-200 dark:bg-red-400/10 rounded-xl" style="width:2.5rem; height:2.5rem;">
                            <i class="pi pi-times-circle text-red-600 !text-xl"/>
                        </div>
                    </div>
                </div>
                <div class="noCustomer p-4 md:p-5 shadow-lg bg-cyan-50 dark:bg-cyan-100/10">
                    <div class="flex justify-between mb-4">
                        <div>
                            <p class="text-xs uppercase text-gray-500">Customers<i class="pi pi-question-circle ml-2" 
                                                                                    style="font-size: 12px" 
                                                                                    v-tooltip="'Total Number of Customers'"/></p>
                            <h3 class="text-xl sm:text-3xl font-medium text-gray-800 dark:text-white mt-1">
                                {{ totalCustomer }}
                            </h3>
                        </div>
                        <div class="flex items-center justify-center bg-cyan-200 dark:bg-cyan-400/10 rounded-xl" style="width:2.5rem; height:2.5rem;">
                            <i class="pi pi-users text-cyan-600 !text-xl"/>
                        </div>
                    </div>
                </div>
            </div>

            <div class="charts">
                <div class="calendarChart p-4 md:p-5 shadow-lg bg-[#FCFCFC] dark:bg-[#18181b]">
                    <DatePicker v-model="date" inline class="w-full sm:w-[25rem]">
                        <template #date="slotProps">
                            <span>
                                <strong 
                                    :style="getBookingStyle(slotProps.date)" 
                                    class="date-box">
                                    {{ slotProps.date.day }}
                                </strong>
                            </span>
                        </template>
                    </DatePicker>
                </div>

                <div class="chartPeak p-4 md:p-5 shadow-lg bg-[#FCFCFC] dark:bg-[#18181b]">
                    <div class="font-semibold text-xl mb-4 mt-4 text-left w-[90%]">Peak Months</div>
                    <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[20rem] w-[30rem]" />
                </div>
            </div>
        </div>
    </main>


</template>

<style scoped>

.h1{
    text-align: center;
    margin-top: 50px;
    font-size: 50px;
    font-weight: bold;
}

.container{
    margin-left: 280px;
    margin-top: 30px;
    padding: 20px;


    width: 80%;
    height: 92%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    max-width: 100%;
}

.headers{
    display: flex;
    justify-content: space-between;
}


.dSection{
    display: flex;
    flex-direction: row;
    margin-top: 30px;
    gap: 50px;
    justify-content: center;

    border-radius: 10px;
    max-width: 100%;
}

.pendingBook, .completedBook, .noCustomer, .cancelledBook{
    height: 100px;
    width: 300px;

    border-radius: 10px;
    max-width: 100%;
}

.charts{
    display: flex;
    flex-direction: row;
    margin-top: 30px;
    gap: 50px;
    justify-content: center;
    height:380px;
    max-height: 550px;

    border-radius: 10px;
    max-width: 100%;
}

.calendarChart, .chartPeak {
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    width: 50%;
    border-radius: 10px;

    max-width: 100%;
}

</style>
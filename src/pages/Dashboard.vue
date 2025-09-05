<template>
  <div class="w-[1300px] mx-auto">
    <Navbar />
    <div v-if="isEmployee">
      <AttendanceButtons />
      <AttendanceHistory />
    </div>
    <div v-if="isManagerOrHr" style="margin-top:16px;">
      <MonthlyReport />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Navbar from '../components/Navbar.vue';
import AttendanceButtons from '../components/AttendanceButtons.vue';
import AttendanceHistory from '../components/AttendanceHistory.vue';
import MonthlyReport from '../components/MonthlyReport.vue';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const role = computed(() => userStore.user?.role);
const isEmployee = computed(() => role.value === 'employee');
const isManagerOrHr = computed(() => role.value === 'hr' || role.value === 'manager');
</script>

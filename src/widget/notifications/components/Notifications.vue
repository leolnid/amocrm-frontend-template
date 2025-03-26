<script setup lang="ts">
import {Component, onMounted, ref} from "vue";
const interval = 500 as const;
const wrapTime = 200 as const;

const props = defineProps<{
  notifications: { id: any, [p:string]: any }[];
  notificationComponent: Component;
}>();

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits(['hide', 'hide-all']);

const showedNumber = ref(0)
onMounted(() => {
  const intervalId = setInterval(() => {
    ++showedNumber.value;
    if (showedNumber.value === props.notifications.length) clearInterval(intervalId);
  }, interval);
});

const hiddenIndexes = ref(new Set<number>());

window['amolensNotifications'] = {
  hiddenIndexes,
  showedNumber,
  props,
}
const wrappedIndexes = ref(new Set<number>());
function hide(index) {
  hiddenIndexes.value.add(index);
  setTimeout(() => {
    wrappedIndexes.value.add(index);
    emit('hide', props.notifications[index].id);
    if (hiddenIndexes.value.size === props.notifications.length) emit('hide-all', hiddenIndexes.value.size);
  }, interval);
}
</script>

<template>
  <!--  <div class="notifications-wrapper">-->
  <div class="notifications-list" v-bind="$attrs">
    <component
        class="notifications-list__item"
        :style="
          `transition: transform ${interval}ms ease-out, max-height ${wrapTime}ms, margin-bottom ${wrapTime}ms, padding ${wrapTime}ms;`
          +
          (
            (showedNumber <= index || hiddenIndexes.has(index))
              ? 'transform: translateX(-100%);'
              : 'transform: translateX(0);'
          )
          +
          (
              wrappedIndexes.has(index)
              ? 'max-height: 0; margin-bottom: 0; padding: 0; box-shadow: none !important;'
              : 'max-height: 180px;'
          )
          "
        :is="notificationComponent"
        v-for="(notification, index) of notifications"
        :notification="notification"
        @read="hide(index)"
        :key="index"
    />
  </div>
  <!--  </div>-->
</template>

<style scoped lang="scss">
.notifications-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  pointer-events: none;
  max-height: 100%;
}
.notifications-list {
  display: flex;
  flex-direction: column-reverse;
  padding: 20px 20px 8px 5px;
  pointer-events: none;
  max-height: 100%;
  overflow: auto;
  flex-grow: 1;
  &::-webkit-scrollbar {
    visibility: hidden;
  }
  &__item {
    pointer-events: auto;
    margin-bottom: 8px;
  }
}
</style>
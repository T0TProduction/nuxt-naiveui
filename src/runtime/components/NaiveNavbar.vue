<template>
  <div class="outer">
    <div class="inner-start">
      <n-button
        v-if="backIcon"
        class="mobileOrTablet"
        text
        tag="span"
        :focusable="false"
        @click="() => router.back()"
      >
        <NaiveIcon
          name="ph:arrow-left"
          :size="backIconSize"
        />
      </n-button>

      <slot name="start" />
    </div>

    <div
      v-if="!isMobileOrTablet"
      class="inner-middle notMobileOrTablet"
    >
      <LazyNMenu
        v-model:value="activePath"
        :inverted="menuInverted"
        mode="horizontal"
        :options="menuOptions"
      />
    </div>

    <div class="inner-end">
      <slot name="end" />

      <n-button
        class="mobileOrTablet"
        text
        tag="span"
        :focusable="false"
        @click="drawerActive = true"
      >
        <slot name="toggle">
          <NaiveIcon
            :name="menuToggleIcon"
            :size="menuToggleIconSize"
          />
        </slot>
      </n-button>
    </div>
  </div>

  <n-drawer
    v-model:show="drawerActive"
    :placement="drawerPlacement"
    :width="drawerWidth"
  >
    <LazyNDrawerContent
      title="Menu"
      :body-content-style="{ padding: 0 }"
      :header-style="{
        padding: '15px',
      }"
      :footer-style="{ justifyContent: 'start' }"
      :closable="drawerClosable"
    >
      <template #header>
        <slot name="drawer-header" />
      </template>

      <slot name="drawer-content" />

      <LazyNMenu
        v-model:value="activePath"
        mode="vertical"
        :inverted="menuInverted"
        :options="menuOptions"
      />

      <template #footer>
        <slot name="drawer-footer" />
      </template>
    </LazyNDrawerContent>
  </n-drawer>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  h,
  useRoute,
  useRouter,
  watchEffect,
  useThemeVars,
  useNaiveDevice,
  defineAsyncComponent,
} from "#imports";
import { NuxtLink, NaiveIcon } from "#components";
import type { Component } from "vue";
import type { MenuOption } from "naive-ui";
import type { NavbarRoute } from "../types";

const drawerActive = ref(false);
const route = useRoute();
const router = useRouter();
const activePath = ref();
const naiveTheme = useThemeVars();
const { isMobileOrTablet } = useNaiveDevice();

const LazyNDrawerContent = defineAsyncComponent(
  () => import("naive-ui/es/drawer/src/DrawerContent")
);
const LazyNMenu = defineAsyncComponent(
  () => import("naive-ui/es/menu/src/Menu")
);

watchEffect(() => {
  activePath.value = "/" + route.path.split("/")[1];
  drawerActive.value = false;
});

const props = withDefaults(
  defineProps<{
    routes?: NavbarRoute[];
    drawerRoutes?: NavbarRoute[];
    menuToggleIcon?: string;
    menuToggleIconSize?: number;
    backIcon?: boolean;
    backIconSize?: number;
    menuInverted?: boolean;
    menuPlacement?: "right" | "left" | "center";
    drawerPlacement?: "top" | "right" | "bottom" | "left";
    sticky?: boolean;
    drawerClosable?: boolean;
    drawerWidth?: string | number;
  }>(),
  {
    routes: () => [],
    drawerRoutes: () => [],
    menuToggleIcon: "ph:equals",
    menuPlacement: "left",
    drawerPlacement: "left",
    menuInverted: false,
    sticky: true,
    menuToggleIconSize: 26,
    backIcon: false,
    backIconSize: 26,
    drawerWidth: "100%",
    drawerClosable: true,
  }
);

const _sticky = computed(() => (props.sticky ? "sticky" : "static"));
const backgroundColor = computed(() => naiveTheme.value.bodyColor);
const flexInnerSides = computed(() =>
  props.menuPlacement === "center" ? 1 : "inherited"
);

const menuOptions = computed<MenuOption[]>(() => {
  const cb = (routes: NavbarRoute[]) =>
    routes.map((route) => {
      const menuOption: MenuOption = {
        label: route.path
          ? () =>
            h(NuxtLink, { to: route.path }, { default: () => route.label })
          : route.label,
        icon: route.icon
          ? () => h(NaiveIcon as Component, { name: route.icon })
          : undefined,
        key: route.path || route.label,
      };

      if (route.children) {
        menuOption.children = cb(route.children);
      }

      return menuOption;
    });

  return cb(
    drawerActive.value && props.drawerRoutes.length
      ? props.drawerRoutes
      : props.routes
  );
});
</script>

<style scoped>
.outer {
  position: v-bind(_sticky);
  background-color: v-bind(backgroundColor);
  top: 0;
  z-index: 100;
  height: 56px;
  padding: 0 16px;
  box-shadow: 0px 0px 2px 0px #a3a3a3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.inner-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex: v-bind(flexInnerSides);
  width: fit-content;
}

.inner-end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex: v-bind(flexInnerSides);
}

.inner-middle {
  flex-grow: 1;
  text-align: v-bind(menuPlacement);
}
</style>
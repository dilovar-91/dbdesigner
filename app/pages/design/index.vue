<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"


import DbEditor from '~/components/design/DbEditor.vue'
import DbDiagram from '~/components/design/DbDiagram.vue'
import { useDbParser } from '~/composables/useDbParser'

const sql = ref<string>(`
brands {
	id bigint pk increments
	name varchar(255)
	logo varchar(255)
	slug varchar(255) unique
	seo_title varchar(255)
	seo_description text
	seo_keywords text
	created_at timestamp
	updated_at timestamp
}

categories {
	id bigint pk increments
	parent_id bigint > categories.id
	name varchar(255)
	slug varchar(255) unique
	image varchar(255)
	seo_title varchar(255)
	seo_description text
	seo_keywords text
	created_at timestamp
	updated_at timestamp
}

products {
	id bigint pk increments
	category_id bigint > categories.id
	brand_id bigint > brands.id
	name varchar(255)
	slug varchar(255) unique
	description text
	price decimal(10,2)
	old_price decimal(10,2)
	stock int def(0)
	sku varchar(100)
	seo_title varchar(255)
	seo_description text
	seo_keywords text
	created_at timestamp
	updated_at timestamp
}

product_gallery {
	id bigint pk increments
	product_id bigint > products.id
	image varchar(255)
	sort_order int def(0)
	created_at timestamp
	updated_at timestamp
}

product_variations {
	id bigint pk increments
	product_id bigint > products.id
	name varchar(255)
	price decimal(10,2)
	old_price decimal(10,2)
	stock int def(0)
	created_at timestamp
	updated_at timestamp
}

variation_options {
	id bigint pk increments
	variation_id bigint > product_variations.id
	name varchar(255)
	value varchar(255)
	updated_at timestamp
}

attribute_groups {
	id bigint pk increments
	name varchar(255)
	sort_order int def(0)
}

attributes {
	id bigint pk increments
	group_id bigint > attribute_groups.id
	name varchar(255)
	unit varchar(50)
}

product_attribute_values {
	id bigint pk increments
	product_id bigint > products.id
	attribute_id bigint > attributes.id
	value varchar(255)
}


site_settings {
	id bigint pk increments
	site_name varchar(255)
	favicon varchar(255)
	logo varchar(255)
	meta_title varchar(255)
	meta_description text
	meta_keywords text
	created_at timestamp
	updated_at timestamp
}


users {
	id bigint pk increments
	role_id bigint > roles.id
	name varchar(255)
	email varchar(255) unique
	phone varchar(30)
	password varchar(255)
	avatar varchar(255)
	status enum('active','banned','pending') default 'active'
	bonus_balance decimal(10,2) default 0
	last_login timestamp
	created_at timestamp
	updated_at timestamp
}

roles {
	id bigint pk increments
    name varchar(255)
	title varchar(255)
	created_at timestamp
	updated_at timestamp
}

cart_items {
	id bigint pk increments
	user_id bigint > users.id
	product_id bigint > products.id
	variation_id bigint > product_variations.id
	quantity int default 1
	price decimal(10,2)
	created_at timestamp
	updated_at timestamp
}


compare_items {
	id bigint pk increments
	user_id bigint > users.id
	product_id bigint > products.id
	added_at timestamp
}


favorites {
	id bigint pk increments
	user_id bigint > users.id
	product_id bigint > products.id
	added_at timestamp
}


bonus_transactions {
	id bigint pk increments
	user_id bigint > users.id
  

	amount decimal(10,2)
	type enum('earn','spend','admin_adjust') default 'earn'
	description varchar(255)
	created_at timestamp
}

seller_bonus_transactions {
	id bigint pk increments
	seller_id bigint > users.id
	amount decimal(10,2)
	type enum('earn','withdraw','admin_adjust') default 'earn'
	description varchar(255)
	created_at timestamp
}


bonus_rules {
	id bigint pk increments
	action varchar(100) -- например: "purchase", "register", "invite_friend"
	points decimal(10,2)
	description varchar(255)
	active boolean default true
	created_at timestamp
	updated_at timestamp
}`)
const schema = ref([])

watch(sql, (val) => {
  const { tables
   } = useDbParser(val)
  schema.value = tables
})

definePageMeta({
  layout: 'dashboard', // NEW: use custom dashboard layout
  title: 'Dashboard',
  description: 'A sidebar that collapses to icons.'
})

useSeoMeta({
  title: 'Dashboard',
  description: 'A sidebar that collapses to icons.'
})
</script>

<template>
  <!-- Now rendered inside <SidebarInset> provided by dashboard layout -->
  <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
    <div class="flex items-center gap-2 px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
  <div class="grid grid-cols-[30%_70%] h-screen">
  <!-- Левая панель — SQL редактор -->
  <div class="border-r overflow-hidden">

    <DbEditor v-model="sql" @keydown.stop @keyup.stop />
  
  </div>

  <!-- Правая панель — диаграмма -->
  <div class="overflow-auto">
    <DbDiagram :schema="schema" />
  </div>
</div>
</template>

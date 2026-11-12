<script lang="ts" module>
  const data = {
    navMain: [
      {
        title: "Inicio",
        url: "/",
        items: [
          {
            title: "Solicitudes",
            url: "/solicitudes",
          },
        ],
      },
    ],
  };
</script>
<script lang="ts">
  import * as Sidebar from "#lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>
<Sidebar.Root {...restProps} bind:ref>
  <Sidebar.Header>
  </Sidebar.Header>
  <Sidebar.Content>
    <!-- We create a Sidebar.Group for each parent. -->
    {#each data.navMain as group (group.title)}
      <Sidebar.Group>
        <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each group.items as item (item.title)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                  {#snippet child({ props })}
                    <a href={item.url} {...props}>{item.title}</a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/each}
  </Sidebar.Content>
  <Sidebar.Rail />
</Sidebar.Root>

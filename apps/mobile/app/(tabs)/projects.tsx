import { PROJECT_STATUSES, projectStatusTone } from '@ismo/shared';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { ProjectRow } from '@/components/ProjectRow';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState, ErrorState, SkeletonBlock } from '@/components/States';
import { Eyebrow } from '@/components/fx/Eyebrow';
import { Accent, Text } from '@/components/Text';
import { useProjects } from '@/hooks/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTheme } from '@/lib/theme';

const statusOptions = PROJECT_STATUSES.map((value) => ({ value, label: projectStatusTone[value].label }));

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const query = useProjects({ search: debouncedSearch || undefined, status: status || undefined });
  const projects = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.pagination.total;

  return (
    <Screen>
      <FlatList
        data={projects}
        keyExtractor={(project) => project.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={query.refetch}
            tintColor={theme.brand}
            colors={[theme.brand]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 14 }}>
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Eyebrow>Workspace</Eyebrow>
                <Button title="New" icon="plus" size="sm" onPress={() => router.push('/project-form')} />
              </View>
              <Text variant="display" style={{ marginTop: 8 }}>
                Your <Accent size={30}>projects</Accent>
              </Text>
              <Text variant="mono" muted style={{ marginTop: 6 }}>
                {total !== undefined ? `${total} ${total === 1 ? 'project' : 'projects'}` : 'Loading'}
              </Text>
            </Animated.View>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search projects by name" />
            <Chips options={statusOptions} value={status} onChange={setStatus} label="Status" />
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(350)}>
            <ProjectRow project={item} />
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          query.isPending ? (
            <View style={{ gap: 8 }}>
              <SkeletonBlock height={84} />
              <SkeletonBlock height={84} />
              <SkeletonBlock height={84} />
            </View>
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={query.refetch} />
          ) : debouncedSearch || status ? (
            <EmptyState
              icon="search"
              title="No matching projects"
              description="Try a different search or clear the filter."
            />
          ) : (
            <EmptyState
              icon="folder"
              title="No projects yet"
              description="Projects group related tasks. Create one to get started."
              action={<Button title="New project" icon="plus" size="sm" onPress={() => router.push('/project-form')} />}
            />
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? <ActivityIndicator style={{ marginTop: 16 }} color={theme.brand} /> : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 32 },
});

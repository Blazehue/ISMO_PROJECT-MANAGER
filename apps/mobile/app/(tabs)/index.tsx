import { Feather } from '@expo/vector-icons';
import { taskStatusTone } from '@ismo/shared';
import { router, type Href } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { AnimatedNumber } from '@/components/fx/AnimatedNumber';
import { Eyebrow } from '@/components/fx/Eyebrow';
import { PulseDot } from '@/components/fx/PulseDot';
import { TickRing } from '@/components/fx/TickRing';
import { LogoMark } from '@/components/LogoMark';
import { ProjectRow } from '@/components/ProjectRow';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StatCard } from '@/components/StatCard';
import { EmptyState, ErrorState, SkeletonBlock } from '@/components/States';
import { Surface } from '@/components/Surface';
import { Accent, Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { UpcomingDeadlines, WorkloadChart } from '@/components/HomeWidgets';
import { useDashboard, useTasksByDueDate } from '@/hooks/queries';
import { useAuth } from '@/lib/auth';
import { greeting, initials } from '@/lib/format';
import { fonts, useTheme, type Hue } from '@/lib/theme';

function QuickAction({
  icon,
  label,
  href,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  href: Href;
}) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={() => router.navigate(href)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      style={[
        styles.quick,
        {
          backgroundColor: pressed ? theme.subtle : theme.surface,
          borderColor: pressed ? theme.brandTrack : theme.border,
        },
      ]}
    >
      <Feather name={icon} size={14} color={theme.textMuted} />
      <Text variant="label" style={{ fontSize: 13 }}>
        {label}
      </Text>
      <Feather
        name="arrow-right"
        size={14}
        color={theme.textMuted}
        style={{ transform: [{ translateX: pressed ? 3 : 0 }] }}
      />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { data, isPending, isError, error, refetch, isRefetching } = useDashboard();
  const dueQuery = useTasksByDueDate();
  const refreshAll = () => Promise.all([refetch(), dueQuery.refetch()]);
  const firstName = user?.name.split(' ')[0] ?? '';
  const rate = data && data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || dueQuery.isRefetching}
            onRefresh={refreshAll}
            tintColor={theme.brand}
            colors={[theme.brand]}
          />
        }
      >
        <View style={styles.header}>
          <LogoMark size={26} />
          <Pressable
            onPress={() => router.navigate('/me')}
            style={[styles.avatar, { backgroundColor: theme.brandSoft }]}
            accessibilityRole="button"
            accessibilityLabel="Your account"
          >
            <Text style={{ fontFamily: fonts.semibold, fontSize: 12 }} color={theme.brandStrong}>
              {user ? initials(user.name) : ''}
            </Text>
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(450)}>
          <Eyebrow>Overview</Eyebrow>
          <Text variant="display" style={{ marginTop: 8 }}>
            {greeting()}, <Accent size={30}>{`${firstName}.`}</Accent>
          </Text>
          <View style={[styles.pill, { backgroundColor: theme.brandSoft }]}>
            <PulseDot color={theme.brand} size={6} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 11.5 }} color={theme.brandStrong}>
              Synced across web &amp; mobile
            </Text>
          </View>
        </Animated.View>

        {isError && !data ? (
          <View style={{ marginTop: 20 }}>
            <ErrorState error={error} onRetry={refetch} />
          </View>
        ) : isPending ? (
          <View style={{ marginTop: 20, gap: 10 }}>
            <SkeletonBlock height={96} />
            <SkeletonBlock height={96} />
            <SkeletonBlock height={180} />
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {[
                [
                  {
                    label: 'Projects',
                    hue: 'lavender' as Hue,
                    value: data.totalProjects,
                    icon: 'folder',
                    hint: `${data.projectsInProgress} in progress`,
                  },
                  {
                    label: 'In progress',
                    hue: 'sky' as Hue,
                    value: data.projectsInProgress,
                    icon: 'zap',
                    hint: 'Projects',
                  },
                ],
                [
                  {
                    label: 'Total tasks',
                    hue: 'lime' as Hue,
                    value: data.totalTasks,
                    icon: 'list',
                    hint: `${data.inProgressTasks} active`,
                  },
                  {
                    label: 'Completed',
                    hue: 'mint' as Hue,
                    value: data.completedTasks,
                    icon: 'check-circle',
                    hint: `${rate}% done`,
                    hintColor: theme.success,
                  },
                ],
                [
                  {
                    label: 'Pending',
                    hue: 'peach' as Hue,
                    value: data.pendingTasks,
                    icon: 'circle',
                    hint: 'Not started',
                  },
                  {
                    label: 'Overdue',
                    hue: 'rose' as Hue,
                    value: data.overdueTasks,
                    icon: 'alert-circle',
                    hint: data.overdueTasks > 0 ? 'Needs attention' : 'All on time',
                    hintColor: data.overdueTasks > 0 ? theme.danger : undefined,
                  },
                ],
              ].map((row, r) => (
                <View key={r} style={styles.gridRow}>
                  {row.map((stat, c) => (
                    <Animated.View
                      key={stat.label}
                      entering={FadeInDown.delay(80 + (r * 2 + c) * 50).duration(400)}
                      style={{ flex: 1 }}
                    >
                      <StatCard
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon as ComponentProps<typeof Feather>['name']}
                        hint={stat.hint}
                        hintColor={stat.hintColor}
                        hue={stat.hue}
                      />
                    </Animated.View>
                  ))}
                </View>
              ))}
            </View>

            {/* Completion: tick ring with a sweeping highlight, like the website's bento card */}
            <Animated.View entering={FadeInDown.delay(380).duration(450)}>
              <Surface style={styles.completion}>
                <TickRing size={118}>
                  <View style={{ alignItems: 'center' }}>
                    <AnimatedNumber value={rate} variant="number" style={{ fontSize: 28 }} />
                    <Text variant="mono" muted style={{ fontSize: 8.5 }}>
                      complete
                    </Text>
                  </View>
                </TickRing>
                <View style={{ flex: 1, gap: 10 }}>
                  <Text variant="heading">Task breakdown</Text>
                  <View style={[styles.bar, { backgroundColor: theme.muted }]}>
                    {(['COMPLETED', 'IN_PROGRESS', 'PENDING'] as const).map((key) => {
                      const value =
                        key === 'COMPLETED'
                          ? data.completedTasks
                          : key === 'IN_PROGRESS'
                            ? data.inProgressTasks
                            : data.pendingTasks;
                      return value > 0 ? (
                        <View key={key} style={{ flex: value, backgroundColor: taskStatusTone[key].solid }} />
                      ) : null;
                    })}
                  </View>
                  {(['COMPLETED', 'IN_PROGRESS', 'PENDING'] as const).map((key) => (
                    <View key={key} style={styles.legend}>
                      <View style={[styles.dot, { backgroundColor: taskStatusTone[key].solid }]} />
                      <Text variant="caption" muted style={{ flex: 1 }}>
                        {taskStatusTone[key].label}
                      </Text>
                      <Text variant="mono" style={{ fontSize: 11 }}>
                        {key === 'COMPLETED'
                          ? data.completedTasks
                          : key === 'IN_PROGRESS'
                            ? data.inProgressTasks
                            : data.pendingTasks}
                      </Text>
                    </View>
                  ))}
                </View>
              </Surface>
            </Animated.View>

            <SectionHeader label="Upcoming deadlines" />
            <UpcomingDeadlines tasks={dueQuery.data} loading={dueQuery.isPending} />

            <SectionHeader label="Next 7 days" />
            <WorkloadChart tasks={dueQuery.data} loading={dueQuery.isPending} />

            <SectionHeader label="Recent projects" action={<TextLink href="/projects" label="View all" muted />} />
            {data.recentProjects.length === 0 ? (
              <EmptyState
                icon="folder"
                title="No projects yet"
                description="Projects group related tasks. Create one to get started."
                action={
                  <Button title="New project" icon="plus" size="sm" onPress={() => router.push('/project-form')} />
                }
              />
            ) : (
              <View style={{ gap: 8 }}>
                {data.recentProjects.map((project, i) => (
                  <Animated.View key={project.id} entering={FadeInRight.delay(450 + i * 70).duration(400)}>
                    <ProjectRow project={project} />
                  </Animated.View>
                ))}
              </View>
            )}

            <SectionHeader label="Quick actions" />
            <View style={styles.quickRow}>
              <QuickAction icon="folder" label="All projects" href="/projects" />
              <QuickAction icon="user" label="Account" href="/me" />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 12,
  },
  grid: { gap: 8, marginTop: 20 },
  gridRow: { flexDirection: 'row', gap: 8 },
  completion: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  bar: { flexDirection: 'row', height: 7, borderRadius: 4, overflow: 'hidden', gap: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

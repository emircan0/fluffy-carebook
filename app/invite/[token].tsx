import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { getInviteErrorMessage } from '../../lib/invites';
import { useAcceptInvite } from '../../lib/mutations/useAcceptInvite';
import { useInvite } from '../../lib/queries/useInvite';
import { colors, layout, radius, spacing } from '../../lib/theme';

const roleLabels = {
  editor: 'Editor',
  viewer: 'Viewer',
};

export default function InviteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token;
  const inviteQuery = useInvite(token);
  const acceptInviteMutation = useAcceptInvite();
  const invite = inviteQuery.data;
  const isPending = invite?.status === 'pending';

  async function handleAccept() {
    if (!token) {
      return;
    }

    try {
      await acceptInviteMutation.mutateAsync(token);
      router.replace('/');
    } catch {
      // Mutation error is rendered below.
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Stack.Screen options={{ title: 'Davet' }} />
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>💌</Text>
          </View>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>YuvioPet</Text>
            <Text style={styles.title}>Bakıcı daveti</Text>
            <Text style={styles.subtitle}>Bir evcil dostun bakım ekibine katılmak üzeresin.</Text>
          </View>

          {inviteQuery.isLoading ? <LoadingState label="Davet bilgileri yükleniyor" /> : null}

          {inviteQuery.error ? (
            <EmptyState
              icon="⚠️"
              text={getInviteErrorMessage(inviteQuery.error)}
              title="Davet açılamadı."
            />
          ) : null}

          {invite ? (
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pet</Text>
                <Text style={styles.detailValue}>{invite.petName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Davet eden</Text>
                <Text style={styles.detailValue}>{invite.invitedByName || invite.invitedBy}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rol</Text>
                <Badge label={roleLabels[invite.role]} variant={invite.role === 'editor' ? 'roleEditor' : 'roleViewer'} />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Durum</Text>
                <Badge label={invite.status} variant={isPending ? 'success' : 'muted'} />
              </View>
            </View>
          ) : null}

          {acceptInviteMutation.error ? (
            <Text style={styles.error}>{getInviteErrorMessage(acceptInviteMutation.error)}</Text>
          ) : null}

          <Button
            disabled={!isPending || acceptInviteMutation.isPending}
            label="Daveti kabul et"
            loading={acceptInviteMutation.isPending}
            onPress={handleAccept}
          />
          <Button label="Ana ekrana dön" onPress={() => router.replace('/')} variant="ghost" />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  container: {
    alignSelf: 'center',
    maxWidth: 560,
    width: '100%',
  },
  card: {
    gap: spacing.lg,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  heroIconText: {
    fontSize: 32,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  details: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.md,
    padding: spacing.md,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  detailValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  error: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger + '30',
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: spacing.md,
  },
});

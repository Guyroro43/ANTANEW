-- ANTA — Permet de cibler les notifications push par plan d'abonnement
-- (gratuit/premium), en plus de "tous" et "sélection manuelle" — utilisé
-- par la notification automatique de publication d'une nouvelle leçon.

alter table public.notification_broadcasts drop constraint if exists notification_broadcasts_target_check;
alter table public.notification_broadcasts add constraint notification_broadcasts_target_check
  check (target in ('all', 'selected', 'plan'));

alter table public.notification_broadcasts add column if not exists target_plan text
  check (target_plan in ('starter', 'premium'));

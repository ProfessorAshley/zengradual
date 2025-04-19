import { useEffect, useState } from 'react';

export function useBadgeSystem(user) {
  const [badge, setBadge] = useState(null);
  const [awardedBadges, setAwardedBadges] = useState([]);

  useEffect(() => {
    if (!user || user.xp == null || user.streak == null) return;

    const newBadges = [];

    // XP Milestone Badges
    if (user.xp >= 100 && !awardedBadges.includes('Rising Star')) {
      newBadges.push('Rising Star');
    }
    if (user.xp >= 250 && !awardedBadges.includes('Trailblazer')) {
      newBadges.push('Trailblazer');
    }
    if (user.xp >= 500 && !awardedBadges.includes('Achiever')) {
      newBadges.push('Achiever');
    }
    if (user.xp >= 1000 && !awardedBadges.includes('XP Master')) {
      newBadges.push('XP Master');
    }

    // Streak Milestone Badges
    if (user.streak >= 3 && !awardedBadges.includes('Focused')) {
      newBadges.push('Focused');
    }
    if (user.streak >= 7 && !awardedBadges.includes('Dedicated')) {
      newBadges.push('Dedicated');
    }
    if (user.streak >= 14 && !awardedBadges.includes('Committed')) {
      newBadges.push('Committed');
    }
    if (user.streak >= 21 && !awardedBadges.includes('Unstoppable')) {
      newBadges.push('Unstoppable');
    }
    if (user.streak >= 30 && !awardedBadges.includes('Streak King')) {
      newBadges.push('Streak King');
    }

    if (newBadges.length > 0) {
      const nextBadge = newBadges[0]; // Show one at a time
      setBadge(nextBadge);
      setAwardedBadges((prev) => [...prev, nextBadge]);
    }

  }, [user, awardedBadges]);

  const dismiss = () => setBadge(null);

  return { badge, dismiss };
}

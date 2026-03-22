const { DonorProfile, Donation } = require('../models');

const DONATION_GAP_DAYS = {
  whole_blood: 56,
  platelets: 7,
  plasma: 28,
  double_red_cells: 112
};

const BADGE_MILESTONES = [
  {
    threshold: 1,
    name: 'First Timer',
    description: 'Completed your first blood donation',
    icon: 'star'
  },
  {
    threshold: 5,
    name: 'Guardian',
    description: 'Completed 5 successful donations',
    icon: 'shield'
  },
  {
    threshold: 10,
    name: 'Champion',
    description: 'Completed 10 successful donations',
    icon: 'trophy'
  },
  {
    threshold: 25,
    name: 'Super Hero',
    description: 'Completed 25 successful donations',
    icon: 'medal'
  },
  {
    threshold: 50,
    name: 'Legendary Hero',
    description: 'Completed 50 successful donations',
    icon: 'crown'
  }
];

function getRankTier(totalDonations) {
  if (totalDonations >= 50) return 'hero';
  if (totalDonations >= 25) return 'platinum';
  if (totalDonations >= 10) return 'gold';
  if (totalDonations >= 5) return 'silver';
  return 'bronze';
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildBadges(totalDonations, existingBadges = []) {
  return BADGE_MILESTONES
    .filter((badge) => totalDonations >= badge.threshold)
    .map((badge) => {
      const existingBadge = existingBadges.find((item) => item.name === badge.name);

      return {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: existingBadge?.earnedAt || new Date()
      };
    });
}

function normalizeMonthlyDonations(monthlyRows, now = new Date()) {
  const countsByMonth = new Map(
    monthlyRows.map((row) => [`${row._id.year}-${row._id.month}`, row.count])
  );

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const series = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const current = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = current.getFullYear();
    const month = current.getMonth() + 1;

    series.push({
      year,
      month,
      label: formatter.format(current),
      count: countsByMonth.get(`${year}-${month}`) || 0
    });
  }

  return series;
}

async function getLeaderboardRank(donorProfileId, totalDonations, points) {
  const higherRankedCount = await DonorProfile.countDocuments({
    _id: { $ne: donorProfileId },
    $or: [
      { totalDonations: { $gt: totalDonations } },
      {
        totalDonations,
        points: { $gt: points }
      }
    ]
  });

  return higherRankedCount + 1;
}

async function syncDonorProfileStats(userId) {
  const donorProfile = await DonorProfile.findOne({ user: userId }).populate(
    'user',
    'firstName lastName email phone avatar address location dateOfBirth gender'
  );

  if (!donorProfile) {
    return null;
  }

  const completedDonationMatch = {
    donor: donorProfile.user._id,
    status: 'completed'
  };

  const [summaryRows, latestDonation, monthlyRows] = await Promise.all([
    Donation.aggregate([
      { $match: completedDonationMatch },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalPoints: { $sum: '$pointsAwarded' }
        }
      }
    ]),
    Donation.findOne(completedDonationMatch)
      .sort({ donationDate: -1 })
      .select('donationDate donationType'),
    Donation.aggregate([
      {
        $match: {
          ...completedDonationMatch,
          donationDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  const summary = summaryRows[0] || {};
  const totalDonations = summary.totalDonations || 0;
  const totalPoints = summary.totalPoints || 0;
  const totalLivesSaved = totalDonations * 3;
  const lastDonationDate = latestDonation?.donationDate || null;
  const donationType = latestDonation?.donationType || donorProfile.preferredDonationType;
  const nextEligibleDate = lastDonationDate
    ? addDays(lastDonationDate, DONATION_GAP_DAYS[donationType] || DONATION_GAP_DAYS.whole_blood)
    : null;
  const badges = buildBadges(totalDonations, donorProfile.badges || []);
  const donorRank = getRankTier(totalDonations);
  const daysUntilEligible = nextEligibleDate
    ? Math.max(
        0,
        Math.ceil((nextEligibleDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  const syncedProfile = await DonorProfile.findByIdAndUpdate(
    donorProfile._id,
    {
      totalDonations,
      totalLivesSaved,
      points: totalPoints,
      lastDonationDate,
      nextEligibleDate,
      donorRank,
      badges
    },
    {
      new: true
    }
  ).populate('user', 'firstName lastName email phone avatar address location dateOfBirth gender');

  const rank = await getLeaderboardRank(syncedProfile._id, totalDonations, totalPoints);

  return {
    donorProfile: syncedProfile,
    stats: {
      bloodGroup: syncedProfile.bloodGroup,
      totalDonations,
      totalLivesSaved,
      points: totalPoints,
      rank,
      rankTier: donorRank,
      badges,
      isAvailable: syncedProfile.isAvailable,
      lastDonationDate,
      nextEligibleDate,
      daysUntilEligible,
      isEligible: daysUntilEligible === 0,
      monthlyDonations: normalizeMonthlyDonations(monthlyRows)
    }
  };
}

module.exports = {
  syncDonorProfileStats
};

const ft_util     = require('../includes/ft_util.js');

(async () => {
  try
  {
    const userId     = 2;
    const user       = await ft_util.getUser(userId);

    const likeAction = true;

    const fameRating = await ft_util.updateFameRating(user, likeAction);

    console.log(`Updated ${user.username}'s fame rating to ${fameRating}`);
    process.exit();
  }
  catch(err)
  {
    throw err;
    process.exit();
  };
})();
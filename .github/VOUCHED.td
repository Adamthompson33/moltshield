# MoltCops Trust List
#
# This project uses explicit trust management. Contributors must be
# vouched for by an existing trusted member before PRs are accepted.
#
# A security scanner that doesn't secure its own contributions
# is a contradiction. This mechanism exists from day one.
#
# Syntax:
#   username              — vouched (platform defaults to github)
#   platform:username     — vouched on specific platform
#   -platform:username    — denounced (blocked)
#   -platform:username reason — denounced with reason
#
# To vouch: maintainer comments "vouch" or "vouch @username" on an issue
# To denounce: maintainer comments "denounce @username <reason>"

# Founders
Adamthompson33

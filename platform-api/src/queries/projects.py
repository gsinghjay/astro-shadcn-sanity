GET_PROJECTS = """
*[_type == "project"
  && (!defined($site) || site == $site)
  && (!defined($sponsor) || sponsor->slug.current == $sponsor)
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  status,
  "sponsor": sponsor->name,
  technologyTags
}
"""
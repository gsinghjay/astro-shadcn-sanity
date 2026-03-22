GET_PROJECTS = """
*[_type == "project" 
  && ($site == "" || site == $site)
  && ($sponsor == null || sponsor->slug.current == $sponsor)
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  status,
  "sponsor": sponsor->name,
  technologyTags
}
"""
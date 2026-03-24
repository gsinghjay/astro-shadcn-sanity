GET_PAGES = """
*[_type == "page" && (!defined($site) || site == $site)] {
  _id,
  title,
  "slug": slug.current,
  blocks
}
"""
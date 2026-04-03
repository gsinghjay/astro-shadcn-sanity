GET_EVENTS = """
*[_type == "event"
  && (!defined($site) || site == $site)
  && ($upcoming == false || date >= now())
] | order(date asc)[0...$limit] {
  _id,
  title,
  date,
  eventType,
  location,
  description
}
"""
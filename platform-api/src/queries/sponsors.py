GET_SPONSORS = """
*[_type == "sponsor" 
  && (!defined($site) || site == $site)
  && (!defined($tier) || tier == $tier)
  && (!defined($featured) || featured == $featured)
]{
  _id, 
  name, 
  tier, 
  website, 
  "projectCount": count(*[_type == "project" && references(^._id) && (!defined($site) || site == $site)])
}
"""
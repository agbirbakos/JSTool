
library("tidyverse")
library("lubridate")
library("readxl")

request_date <- '2018-09-15'
today <- '2018-09-25'

request_date <- yday(as.Date(request_date))
today <- yday(as.Date(today))

met <- read_xlsx("isusm.xlsx") %>%
  mutate(valid = as.Date(valid),
         doy = yday(valid),
         year = year(valid)) %>%
  filter(doy %in% (request_date - 2):(request_date + 30)) %>%
  mutate_at(c("high","low","rh"),round,digits = 1) %>%
  gather(variable,value,high,low,rh)

met <- met %>%
  left_join(met %>%
              filter(year == 2018) %>%
              transmute(doy,variable,value18 = value)) %>%
  left_join(met %>%
              filter(year != 2018) %>%
              group_by(doy,variable) %>%
              summarise(valueHist = mean(value))) %>%
  mutate(value =  ifelse(doy < today,value18,
                         ifelse(year == 2018,valueHist,value))) %>%
  select(-value18,-valueHist) %>%
  spread(variable,value)

head <- "var Met = {
  'type': 'FeatureCollection',
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': [-93.7743, 42.02094]
    },
    'properties': {
      'data': ["


write_lines(head,"example.geojson")


for(i in unique(met$year)){

out <- paste0(
"    {'year' : ",i,",
      'valid': ['",paste0(met$valid[met$year == i], collapse = "','"),"'],
      'high': [",paste0(met$high[met$year == i], collapse = ","),"],
      'low': [",paste0(met$low[met$year == i], collapse = ","),"],
      'rh': [",paste0(met$rh[met$year == i], collapse = ","),"]
     },")

write_lines(out,"example.geojson", append = T)

}


tail <-"]}}]};"

write_lines(tail,"example.geojson", append = T)

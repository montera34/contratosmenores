# Este script  

library(gsubfn)
library(tidyverse)

# ------ Load contratos ----------
contratos <- read.delim("data/comunidad-madrid_contratospublicos_15_17.csv",sep = ",")


# ------ save small contratos list ----------
contratos_test <-  contratos[1:1000,]
contratos[354547,c("adjudicadora")]

contratos$year <- as.numeric(strapplyc( as.character(contratos$fecha_publicacion), "[0-9]* .* ([0-9]*)", simplify = TRUE))

write.csv(contratos[contratos$year=="2015",], file = "data/comunidad-madrid_contratospublicos_2015.csv")


# Salva por adjudicadora
write.csv(contratos[contratos$adjudicadora=="Consejería de Sanidad-Servicio Madrileño de Salud -Hospital Clínico San Carlos",], 
          file = "data/comunidad-madrid_contratospublicos_hostpital-clinico-san-carlos.csv")

sancarlos <- contratos[contratos$adjudicadora=="Consejería de Sanidad-Servicio Madrileño de Salud -Hospital Clínico San Carlos",]
# contratos_2017 <- contratos[contratos$year="2017",]

write.csv(contratos[contratos$adjudicatario=="",], 
          file = "data/comunidad-madrid_contratospublicos_hostpital-clinico-san-carlos.csv")


# ------ una empresa ----------
# Por nombre de empresa
# Garbialdi, S.A
# 29
# Garbialdi, S.A.
# 29
# GARBIALDI, S.A.
# 38
# GARBIALDI SAL
# 11
# GARBIALDI S.A.L
# 9
contratos[contratos$adjudicatario=="Limpiezas y servicios Salamanca",]

empresa <- contratos[contratos$adjudicatario=="GARBIALDI S.A.L.",]
# usa NIF mejor

empresa <- contratos[contratos$NIF=="A48408769" | contratos$NIF=="A61895371" | contratos$NIF=="A28923365",]

empresa <- empresa[1:116,]
  
empresa$year <- as.numeric(strapplyc( as.character(empresa$fecha_publicacion), "[0-9]* .* ([0-9]*)", simplify = TRUE))
empresa$month <- as.character(strapplyc( as.character(empresa$fecha_publicacion), "[0-9]* (.*) [0-9]*", simplify = TRUE))
empresa$day <- as.numeric(strapplyc( as.character(empresa$fecha_publicacion), "([0-9]*) .* [0-9]*", simplify = TRUE))

empresa[empresa$month=="enero",]$month <- "1"
empresa[empresa$month=="febrero",]$month <- "2"
empresa[empresa$month=="marzo",]$month <- "3"
empresa[empresa$month=="abril",]$month <- "4"
empresa[empresa$month=="mayo",]$month <- "5"
empresa[empresa$month=="junio",]$month <- "6"
empresa[empresa$month=="julio",]$month <- "7"
empresa[empresa$month=="agosto",]$month <- "8"
empresa[empresa$month=="septiembre",]$month <- "9"
empresa[empresa$month=="octubre",]$month <- "10"
empresa[empresa$month=="noviembre",]$month <- "11"
empresa[empresa$month=="diciembre",]$month <- "12"

empresa$date <- as.Date( paste( empresa$day,"/",empresa$month,"/", empresa$year, sep = ""), "%d/%m/%Y")

# ------ una empresa plot ----------
ggplot() +
  geom_point(data=empresa[empresa$tipo_publicacion=="Contratos Menores",],aes(date,NIF,size=sinIVA),
             position = "jitter", alpha=0.2) +
  theme_minimal(base_family = "Roboto", base_size = 12) +
  theme(
    # panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    panel.grid.major.y = element_blank(),
    panel.grid.minor.y = element_blank()
  ) +
  labs(title = "Contratos menores de 3 empresas",
       subtitle = "Garbialdi, Limpiezas y Servicios Salamanca y ISS Facility Services",
       x = "Fecha de publicación",
       y = "",
       caption = "Fecha según fecha de publicación. Datos: Hmeleiros") 




#----------salva listado de adjudicadores y adjudicatarios--------------
adjudicadora <- data.frame(table(contratos$adjudicadora))
write.csv(adjudicadora, file = "data/cm-adjudicadoras.csv")
adjudicatario <- data.frame(table(contratos$adjudicatario))
write.csv(adjudicatario, file = "data/cm-adjudicatarios.csv")
adjudicatarioNIF <- data.frame(table(contratos$NIF))
write.csv(adjudicatarioNIF, file = "data/cm-adjudicatarios-nif.csv")

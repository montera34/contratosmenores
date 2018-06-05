# Este script  

library(gsubfn)
library(tidyverse)
# library(lubridate) # para extraer mes

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

#----------salva listado de adjudicadores y adjudicatarios--------------
adjudicadora <- data.frame(table(contratos[contratos$tipo_publicacion=="Contratos Menores",]$adjudicadora))
write.csv(adjudicadora, file = "data/cmadrid-contratos-menores-adjudicadoras-2015-2017.csv")
adjudicatario <- data.frame(table(contratos[contratos$tipo_publicacion=="Contratos Menores",]$adjudicatario))
write.csv(adjudicatario, file = "data/cmadrid-contratos-menores-adjudicatarios-2015-2017.csv")
adjudicatarioNIF <- data.frame(table(contratos[contratos$tipo_publicacion=="Contratos Menores",]$NIF))
write.csv(adjudicatarioNIF, file = "data/cmadrid-contratos-menores-adjudicatarios-nif.csv")

# ------ análisis empresas seleccionadas ----------
# replicando este análisis https://www.eldiario.es/madrid/Educacion-millones-contratos-limpieza-presupuesto_0_778672919.html

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
# Hace falta usar el NIF para identificarlos
contratos[contratos$adjudicatario=="Limpiezas y servicios Salamanca",]

empresa <- contratos[contratos$adjudicatario=="GARBIALDI S.A.L.",]
# usa NIF mejor

empresa <- contratos[contratos$NIF=="A48408769" | contratos$NIF=="A61895371" | contratos$NIF=="A28923365",]

empresa  <- empresa  %>% na.omit()

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

empresa$month <- as.integer(empresa$month)
  
empresa$date <- as.Date( paste( empresa$day,"/",empresa$month,"/", empresa$year, sep = ""), "%d/%m/%Y")

empresa$empresaname <- "-"
empresa[empresa$NIF =="A48408769",]$empresaname <- "Garbialdi"
empresa[empresa$NIF =="A61895371",]$empresaname <- "ISS Soluciones de Limpieza"
empresa[empresa$NIF =="A28923365",]$empresaname <- "Limpiezas y Servicios Salamanca"

# creates factor
empresa$empresaname <- as.factor(empresa$empresaname)
# reorder factors
# empresa$empresa <- factor(empresa$empresa, levels = c("ISS Soluciones de Limpieza", "Garbialdi","Limpiezas y Servicios Salamanca"))
empresa$empresaname <- relevel(empresa$empresaname, "ISS Soluciones de Limpieza")
empresa$empresaname <- relevel(empresa$empresaname, "Garbialdi")
empresa$empresaname <- relevel(empresa$empresaname, "Limpiezas y Servicios Salamanca")

# ------ Visualizaciones de empresas seleccionadas ----------
empresa$dayx <- as.integer(strftime(empresa$date, format = "%j"))

# Puntos son contratos menores: x fecha, y cantidad, color empresa
empresa[empresa$tipo_publicacion=="Contratos Menores",] %>% na.omit() %>% 
ggplot(aes(x = date, y = sinIVA)) +
  geom_point(aes(color=empresaname), alpha=0.5) +
  labs(title = "Contratos menores enComunidad de Madrid en 3 empresas",
       subtitle = "Garbialdi, Limpiezas y Servicios Salamanca y ISS Facility Services",
       x = "Fecha de publicación",
       y = "",
       caption = "Datos: https://github.com/meneos/contratacionCM") +
    theme_minimal(base_family = "Roboto", base_size = 12) +
    theme(
      # panel.grid.major.x = element_blank(),
      # panel.grid.minor.x = element_blank(),
      panel.grid.major.y = element_blank(),
      panel.grid.minor.y = element_blank()
    )

# Plotea puntos por empresa, tamaño según cantidad sin IVA
ggplot() +
  geom_point(data=empresa[empresa$tipo_publicacion=="Contratos Menores",],
             aes(date,empresaname,size=sinIVA),
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


# extract month
# empresa<- empresa %>% mutate(monthx = month(date))
png(filename="analisis/images/contratos-3-empresas-cmadrid-2015-2017.png",width = 800,height = 400)
empresa[empresa$tipo_publicacion=="Contratos Menores",] %>% na.omit() %>% 
  ggplot(aes(x = month, y = sinIVA)) +
  geom_bar(aes(fill=empresaname),stat = "identity") +
  labs(title = "Contratos menores en Comunidad de Madrid en 3 empresas limpieza colegios por mes",
       subtitle = "Garbialdi, Limpiezas y Servicios Salamanca y ISS Facility Services",
       x = "Fecha de publicación",
       y = "euros (sin IVA)",
       caption = "Datos: contratación pública en la C. de Madrid (2015-2017) elaborado por @hmeleiros.") +
  theme_minimal(base_family = "Roboto", base_size = 11) +
  xlim(c(1,12)) +
  theme(
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    # panel.grid.major.y = element_blank(),
    panel.grid.minor.y = element_blank()
  ) +
  scale_x_continuous(breaks = pretty(empresa$month, n = 12)) +
  scale_y_continuous(breaks = pretty(empresa$sinIVA, n = 100)) +
  facet_wrap(~ year)
dev.off()


ggplot(empresa, aes(date, ..count..)) +
  theme_minimal(base_family = "Roboto Condensed", base_size = 10) +
  theme(
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    axis.ticks.x= element_line(size = 0.1),
    panel.grid.minor.y = element_blank()
    # panel.grid.major.y = element_blank(),
    # axis.text.y=element_blank()
  ) +
  geom_histogram(aes(fill=empresa),binwidth = 30.41, colour="white") +
  labs(title = "Nº de contratos menores enComunidad de Madrid en 3 empresas. Mensual",
       subtitle = "Garbialdi, Limpiezas y Servicios Salamanca y ISS Facility Services",
       x = "Fecha de publicación",
       y = "",
       caption = "Datos: https://github.com/meneos/contratacionCM") 


ggplot(empresa, aes(date, ..count..)) +
  theme_minimal(base_family = "Roboto Condensed", base_size = 10) +
  theme(
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    axis.ticks.x= element_line(size = 0.1),
    panel.grid.minor.y = element_blank()
    # panel.grid.major.y = element_blank(),
    # axis.text.y=element_blank()
  ) +
  geom_histogram(aes(fill=empresa),binwidth = 91.25, colour="white")+
  labs(title = "Contratos menores enComunidad de Madrid en 3 empresas. Trimestral",
       subtitle = "Garbialdi, Limpiezas y Servicios Salamanca y ISS Facility Services",
       x = "Fecha de publicación",
       y = "",
       caption = "Datos: https://github.com/meneos/contratacionCM") 


empresa_sum <- empresa %>% 
  group_by(month,NIF) %>% 
  summarise(sum=sum(sinIVA)) %>% arrange(-sum)

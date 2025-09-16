// src/pages/DishDetails.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { api } from "../api";
import {
  Container, Grid, Card, CardMedia, CardContent,
  Typography, Button, Breadcrumbs, Link
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DishDetails() {
  const { id } = useParams();
  const [dish, setDish] = useState(null);

  useEffect(() => {
    api.get(`/dishes/${id}`).then(({ data }) => setDish(data.data || data));
  }, [id]);

  const storageUrl = useMemo(
    () => `${import.meta.env.VITE_API_URL}/storage/`,
    []
  );

  // Сглобяваме надежден източник за снимката
  const imgSrc = useMemo(() => {
    if (!dish) return null;
    return dish.image_url || (dish.image ? storageUrl + dish.image : null);
  }, [dish, storageUrl]);

  if (!dish) return <Container sx={{ py: 6 }}>Зареждане…</Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/menu">Меню</Link>
        <Typography color="text.primary">{dish.category?.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={5}>
          <Card>
            {imgSrc ? (
              <CardMedia
                component="img"
                image={imgSrc}
                alt={dish.name}
                onError={(e) => {
                  // ако пътят е грешен – скриваме картинката и показваме placeholder
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <CardContent sx={{ textAlign: "center", py: 8 }}>
                <Typography color="text.secondary">Без снимка</Typography>
              </CardContent>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Typography variant="h4" gutterBottom>{dish.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Категория: {dish.category?.name}
          </Typography>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {Number(dish.price).toFixed(2)} лв.
          </Typography>
          {dish.description && (
            <Typography variant="body1" paragraph>{dish.description}</Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/menu"
          >
            Назад към менюто
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

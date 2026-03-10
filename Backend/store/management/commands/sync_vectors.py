from django.core.management.base import BaseCommand
from store.models import Product
from store.utils import get_image_vector
import os

class Command(BaseCommand):
    help = 'Generates vector embeddings for products with images that are missing them'

    def handle(self, *args, **options):
        products = Product.objects.filter(embedding__isnull=True).exclude(image='')

        if not products.exists():
            self.stdout.write(self.style.SUCCESS('All products are already synced!'))
            return

        for product in products:
            if os.path.exists(product.image.path):
                vector = get_image_vector(product.image.path)
                product.embedding = vector
                product.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully updated {product.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'File not found for {product.name}, skipping.'))
from django.contrib import admin

from .models import MyList, MyListItem


@admin.register(MyList)
class MyListModelAdmin(admin.ModelAdmin):
    pass


@admin.register(MyListItem)
class MyListItemModelAdmin(admin.ModelAdmin):
    pass

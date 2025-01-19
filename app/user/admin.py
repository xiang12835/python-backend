from django.contrib import admin
from app.user.models.user_model import SystemUser

# Register your models here.


class SystemUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'date_joined')
    search_fields = ('username', 'email')
    list_filter = ('date_joined',)


admin.site.register(SystemUser, SystemUserAdmin)


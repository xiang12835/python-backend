from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = (
        (0, "管理员"),
        (1, "运营"),
        (2, "普通用户"),
    )

    SUPERUSER = 0
    EDITOR = 1
    NORMAL = 2

    role = models.IntegerField(verbose_name=u'用户角色', choices=ROLE_CHOICES, default=1)
    '''
    # 重写groups字段，并指定related_name
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="custom_user_groups",
        related_query_name="user",
    )

    # 重写user_permissions字段，并指定related_name
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_permissions",
        related_query_name="user",
    )
    '''
    class Meta:
        app_label = 'user'


    def __str__(self):
        return self.name

    def to_json(self):
        d = {
            "id": self.id,
            "name": self.name,
            "age": self.age,
        }
        return d

    @property
    def role_name(self):
        role_dic = dict(self.ROLE_CHOICES)
        return role_dic.get(self.role, "无")

    @property
    def is_manager(self):
        return self.is_super or self.is_super_editor

    @property
    def is_super(self):
        return self.role == self.SUPERUSER

    @property
    def is_super_editor(self):
        return self.role == self.EDITOR

    @property
    def is_normal_user(self):
        return self.role == self.NORMAL

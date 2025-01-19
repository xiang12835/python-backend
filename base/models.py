from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.contrib import auth
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.db import models
from django.db.models.manager import EmptyManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# Create your models here.

class MinimalUserManager(UserManager):
    def create_user(self, username, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 1)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # 注意：这里没有要求email字段必须提供
        return self._create_user(username, email=extra_fields.pop('email', None), password=password, **extra_fields)


class User(AbstractUser):
    NORMAL = 0
    SUPERUSER = 1
    EDITOR = 2

    ROLE_CHOICES = (
        (0, "普通用户"),
        (1, "管理员"),
        (2, "运营"),
    )

    role = models.IntegerField(verbose_name=u'用户角色', choices=ROLE_CHOICES, default=0)
    age = models.IntegerField(verbose_name=u'年龄', blank=True, null=True)
    email = models.EmailField(_('email address'), blank=True, null=True)

    objects = MinimalUserManager()

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

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        # app_label = 'base'


    def __str__(self):
        return self.username

    def to_json(self):
        d = {
            "id": self.id,
            "name": self.username,
            "age": self.age,
            "role": self.role,
        }
        return d

    def is_active_user(self):
        return self.is_active

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


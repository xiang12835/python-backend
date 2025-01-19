from django.shortcuts import render
import json
from django.contrib import messages
from django.shortcuts import render, get_object_or_404
from base.core.wi_model_util.imodel import get_object_or_none
from django.contrib.auth.decorators import login_required
# from django.core.urlresolvers import reverse
from django.urls import reverse, NoReverseMatch
from django.http import HttpResponse, HttpResponseRedirect
from base.utils.default import redefine_item_pos
from base.utils.common import get_paged_dict
# from app.user.models.user_model import User
from base.models import User
from django.http import HttpResponse

# Create your views here.


def index(request):
    return HttpResponse("Hello Word!")



@login_required
def system_user_list(request):
    qd = request.GET
    datas = User.objects.all().order_by("-pk")

    search_key = qd.get('search_key', '')
    if search_key:
        datas = datas.filter(username__contains=search_key)
    context = {
        "search_key": search_key,
        "current_user": request.user,
        "datas": datas,
        "query_key": {
        }
    }
    context.update(get_paged_dict(datas, request.GET.get('page'), 20, 'datas'))
    return render(request, 'system_user/user_list.html', context)


@login_required
def system_user_new(request):
    if request.method == 'POST':
        qd = request.POST
        _id = qd.get("itemid", "")
        if _id:
            item = User.objects.get(pk=_id)
        else:
            item = User()
            item.set_password(qd.get("password", ''))
        item.role = qd.get("role", 0)
        item.username = qd.get("username", '')
        item.email = qd.get("email", '')
        item.first_name = qd.get("first_name", '')
        item.last_name = qd.get("last_name", '')
        item.save()
        return HttpResponseRedirect(reverse("system_user_list"))
    else:
        qd = request.GET
        _id = qd.get("itemid", "")
        if _id:
            item = User.objects.get(pk=_id)
        else:
            item = User()
        context = {
            "item": item,
            "current_user": request.user,

        }

        return render(request, 'system_user/user_new.html', context)


@login_required
def change_password(request):
    if request.method == "POST":
        qd = request.POST
        user_id = qd.get("user_id", 0)
        user = User.objects.filter(pk=user_id).first()
        user.set_password(qd.get("password", ''))
        user.save()
        return HttpResponseRedirect(reverse("system_user_list"))
    else:
        qd = request.GET
        user_id = qd.get("user_id", 0)
        user = User.objects.filter(pk=user_id).first()
        return render(request, 'system_user/user_password.html', {"user": user})



from dataclasses import dataclass
from typing import Optional, Any

import requests

SPACEDECK_EMAIL = 'admin@synchronous.localhost'
SPACEDECK_PASSWORD = 'y(@#"}T6d65B!v?V'  # TODO: change this
SPACEDECK_INVITE_CODE = 'top-sekrit'  # TODO: change this in spacedeck config


@dataclass
class Space:
    _id: str  # id of the space
    name: str  # name of the space
    space_type: str  # type of the space? only seen 'space' so far, folder might be possible
    creator_id: str  # id of the space's creator
    parent_space_id: str  # id of the parent space
    access_mode: str  # public/private
    password: Optional[str]
    edit_hash: str  # hash that enables editing (/spaces/<_id>?spaceAuth=<edit_hash>)
    edit_slug: str  # slug for generating edit URL
    editors_locking: Any
    thumbnail_uri: Optional[str]
    width: Optional[int]
    height: Optional[int]
    background_color: Optional[str]
    background_uri: Optional[str]
    created_at: str
    updated_at: str
    thumbnail_url: Optional[str]
    thumbnail_updated_at: Optional[str]
    createdAt: str  # possibly the same as created_at?
    updatedAt: str  # possibly the same as updated_at?

    def get_url(self, base_url, nickname='Guest'):
        return f'{base_url}/spaces/{self._id}?spaceAuth={self.edit_hash}&nickname={nickname}'


class SpacedeckClient:
    def __init__(self, base_url='http://localhost:9666'):
        self.base_url = base_url
        self.session = requests.Session()

        sd_session_resp = self.session.post(
            self.base_url + '/api/sessions',
            json={'email': SPACEDECK_EMAIL, 'password': SPACEDECK_PASSWORD}
        )

        # create a new spacedeck user if our user was not found
        if sd_session_resp.status_code == 404:
            resp = self.session.post(
                self.base_url + '/api/users',
                json={'email': SPACEDECK_EMAIL,
                      'nickname': '',
                      'password': SPACEDECK_PASSWORD,
                      'password_confirmation': SPACEDECK_PASSWORD,
                      'invite_code': SPACEDECK_INVITE_CODE}
            )
            assert resp.status_code == 201

            sd_session_resp = self.session.post(
                self.base_url + '/api/sessions',
                json={'email': SPACEDECK_EMAIL, 'password': SPACEDECK_PASSWORD}
            )

        sd_session = sd_session_resp.json()
        self.token = sd_session['token']
        self.session.headers.update({'X-Spacedeck-Auth': self.token})

    def __str__(self):
        return f'SpacedeckClient(token={self.token})'

    def create_space(self, name='Untitled Space'):
        data = self.session.post(
            self.base_url + '/api/spaces',
            json={'name': name}
        ).json()

        space_id = data['_id']

        # must include name in PUT request because spacedeck calculates
        # slug from name no matter if name exists or not
        data = self.session.put(
            self.base_url + f'/api/spaces/{space_id}',
            json={'access_mode': 'public', 'name': name}
        ).json()

        return Space(**data)

    def delete_space(self, space_id):
        resp = self.session.delete(
            self.base_url + f'/api/spaces/{space_id}',
        )

        return resp.ok
